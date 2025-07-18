import { SquareArrowOutUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { getPostById, getPostBySlug } from "@/database/post/post.repository";
import { IPost } from "@/types/post.type";
import { calculateReadingTime, cleanContent } from "@/utils/post.utils";
import { getPublishTimeStamp } from "@/utils/time.utils";
import Comments from "../_components/Comments";
import RecommendedArticles from "../_components/RecommendedArticles";
import ShareButton from "../_components/ShareButton";
import AnimateTitle from "@/app/[locale]/(app)/_components/AnimateTitle";
import DownloadPost from "../_components/DownloadPost";
import { connectToDatabase, newId } from "@/lib/database";
import Reactions from "../_components/Reactions";
import { validateRequest } from "@/lib/auth/auth";
import { checkLike } from "@/database/like/like.repository";
import { checkDislike } from "@/database/dislike/dislike.repository";
import dynamic from "next/dynamic";
import ReportDialog from "../_components/ReportDialog";
import BatchModel from "@/database/batch/batch.model";
import RelatedExternalArticles from "../_components/RelatedExternalArticles";
import { NewsletterSignUpForm } from "@/components/layout/NewsletterForm";
import { StickyNewsletterBanner } from "@/components/layout/NewsletterForm/StickyNewsletterBanner";
import { getCategoriesByWriter } from "@/constants/writers";
import { Badge } from "@/components/ui/badge";
import { extractPath } from "@/categories";
import CategoryListClient from "../_components/CategoryListClient";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);
  return {
    title: post?.title,
    description: post?.description,
    openGraph: {
      title: post?.title,
      description: post?.description,
      images: post?.image_url,
      type: "article",
    },
  };
}

const ShareArray = dynamic(() => import("../_components/ShareArray"), {
  ssr: false,
});

// determine if a site allows being rendered as an iframe
const canEmbedInIframe = async (url: string) => {
  if (!url.includes("http")) {
    url = "https://" + url;
  }

  try {
    const response = await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
    });
    const xFrameOptions = response.headers
      .get("X-Frame-Options")
      ?.toLowerCase();
    const contentSecurityPolicy = response.headers
      .get("Content-Security-Policy")
      ?.toLowerCase();

    if (
      xFrameOptions?.includes("sameorigin") ||
      xFrameOptions?.includes("deny")
    ) {
      return false;
    }

    if (contentSecurityPolicy?.includes("frame-ancestors")) {
      return !contentSecurityPolicy.includes("none");
    }

    return true;
  } catch (error) {
    console.error("Error fetching headers.");
    return false;
  }
};

const OutboundLink = async ({
  source_url,
  source_link,
  article_id,
}: {
  source_url: string;
  source_link: string;
  article_id: string;
}) => {
  const canIframe = await canEmbedInIframe(source_url);
  return (
    <>
      {canIframe ? (
        <Link href={`/post/out/${article_id}`} rel="nofollow">
          <SquareArrowOutUpRight className="text-muted-alt" />
        </Link>
      ) : (
        <a href={source_link!} target="_blank" rel="noopener noreferrer">
          <SquareArrowOutUpRight className="text-muted-alt" />
        </a>
      )}
    </>
  );
};

const isZealArticle = (categoryList: string[]) => {
  const categories = [
    "Zeal Headline News",
    "Zeal Global",
    "Zeal Entertainment",
    "Zeal Lifestyle",
    "Business 360",
    "Zeal Tech",
    "Zeal Sports",
  ];

  for (const category of categoryList) {
    if (categories.includes(category)) {
      return true;
    }
  }

  return false;
};

export default async function PostPage({
  params,
  subPost,
}: {
  params?: { slug: string };
  subPost?: IPost;
}) {
  await connectToDatabase();
  const article_slug: string = params?.slug || subPost!.slug;
  // const article_id: string = params?.postId || subPost!._id!.toString();

  let post: IPost | null;

  if (subPost) {
    post = subPost;
  } else {
    // post = await getPostById(article_id);
    post = await getPostBySlug(article_slug);
  }

  if (!post) {
    return (
      <div className="flex h-[calc(100vh-62px)] items-center justify-center text-3xl max-[900px]:px-7">
        Post not found
      </div>
    );
  }

  const article_id: string = post._id!.toString();

  const { user } = await validateRequest();
  let like: boolean | undefined = undefined;
  let dislike: boolean | undefined = undefined;

  if (user) {
    // get reaction
    like = await checkLike(user.id, newId(article_id));
    dislike = await checkDislike(user.id, newId(article_id));
  }

  // console.log(post.content);
  if (post.external) {
    post.content = cleanContent(post.content, post.source.url!);
  }

  const relatedExternalArticles =
    (
      await BatchModel.findOne({
        name: post.title,
      })
        .select("articles")
        .lean()
        .exec()
    )?.articles || [];

  return (
    // <main className="flex min-h-[calc(100vh-62px)] gap-4">
    <main className="flex min-h-[calc(100vh-60px)] w-[70vw] flex-col gap-3 px-12 py-4 max-[900px]:px-7 max-[750px]:w-auto max-[500px]:px-4">
      {/* <NewsletterSignUpForm />
      <StickyNewsletterBanner /> */}
      <div className="flex flex-col gap-3">
        <h1 className="text-[22px] font-extrabold text-foreground-alt">
          {post.title}
        </h1>
        <div className="flex items-center justify-between max-[600px]:flex-col max-[600px]:items-start max-[600px]:justify-center">
          <div className="flex items-center gap-3">
            <span className="text-sm font-normal text-muted-alt">
              Published {getPublishTimeStamp(post.published_at as string)}
            </span>
            <span className="text-sm font-normal text-muted-alt">
              • {calculateReadingTime(post.content)} minute read
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ShareButton slug={article_slug} />
            {post.external && (
              <Suspense>
                <OutboundLink
                  source_url={post.source.url!}
                  source_link={post.link!}
                  article_id={article_id}
                />
              </Suspense>
            )}
            <DownloadPost
              article={{
                _id: article_id,
                title: post.title,
                author_id: post.author_id.toString(),
                category: post.category,
                description: post.description,
                image: post.image_url,
                published_at: post.published_at as string,
                ttr: post.ttr,
                content: post.content,
                source: {
                  name: post.source.name!,
                  icon: post.source.icon!,
                },
              }}
            />
          </div>
        </div>
      </div>

      {!post.external && post.author_id.toString() !== "Zeal News" && (
        <div className="flex gap-2">
          <div className="size-12 overflow-hidden rounded-full">
            <img
              className="object-cover"
              src={post.source.icon}
              alt={post.source.name}
            />
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm font-normal text-muted-alt">
              <strong>{post.source.name}</strong>
            </span>
            <div className="flex flex-wrap gap-1 text-sm font-normal text-muted-alt">
              <span>
                {post.category.map((category, index) => (
                  <Badge key={index}>
                    <Link href={extractPath(category)}>{category}</Link>
                  </Badge>
                ))}
              </span>
            </div>
            {/* <CategoryListClient
              categories={getCategoriesByWriter(post.source.name!)}
            /> */}
          </div>
        </div>
      )}

      {(isZealArticle(post.category) || !post.external) && post.image_url && (
        <img
          className="w-full rounded-md object-cover"
          src={post.image_url}
          alt={post.title}
        />
      )}

      <div
        className="rounded-[20px] p-1 text-sm [&_a]:text-blue-500 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:font-bold [&_figure>img]:mb-2 [&_figure>img]:mt-4 [&_figure>img]:rounded-md [&_figure>p]:text-black [&_figure]:mb-7 [&_figure]:flex [&_figure]:w-full [&_figure]:flex-col [&_figure]:items-center [&_img]:mx-auto [&_img]:block [&_img]:rounded-md [&_img]:object-cover [&_img]:object-center [&_li]:list-disc [&_p]:mb-4 [&_p]:max-w-[100vw] [&_p]:text-base [&_p]:font-normal [&_p]:leading-7 [&_p]:text-foreground-alt-p"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      {/* max-h-[350px] */}
      {/* [&_img]:max-h-[350px] [&_figure>img]:max-h-[350px] */}
      {isZealArticle(post.category) && (
        <div>
          <span className="flex items-center gap-2">
            <strong>From Zeal News Studio</strong>
            <Link
              href="/info/terms-and-conditions"
              className="text-xs underline"
            >
              (Terms and Conditions)
            </Link>
          </span>
        </div>
      )}
      {post.external && (
        <a
          href={`https://${post.source.url!}`}
          rel="noopener noreferrer noindex"
          target="_blank"
          className="ml-auto flex size-fit items-center gap-1 rounded-md px-4 py-2 outline outline-2 outline-[#2F7830]"
        >
          <span className="mr-2 text-base font-semibold text-muted-alt">
            Origin:{" "}
          </span>
          {post.source.icon && (
            <div className="rounded-sm bg-gray-300 p-1">
              <img
                src={post.source.icon}
                className="h-5 rounded-full max-[300px]:h-5"
                alt="publisher logo"
              />
            </div>
          )}
          <span className="text-base font-semibold text-foreground-alt max-[300px]:text-base">
            {post.source.name!}
          </span>
        </a>
      )}
      <ShareArray title={post.title} />
      <div className="flex w-full items-center justify-end">
        <Reactions reaction={{ like, dislike }} postID={article_id} />
      </div>
      {relatedExternalArticles.length > 0 && (
        <RelatedExternalArticles articles={relatedExternalArticles} />
      )}
      <Separator />
      <div className="flex justify-end">
        <ReportDialog articleId={article_id} />
      </div>
      <span id="data-article-end" />
      <Separator />
      <Suspense fallback={<div>Loading...</div>}>
        <Comments postID={article_id} />
      </Suspense>
      <Separator />
      <Suspense fallback={<div>Loading...</div>}>
        <RecommendedArticles
          id={article_id}
          headline={
            post.headline
              ? { isHeadline: true, cluster: post.cluster_id as string }
              : undefined
          }
          domain={post.source.name as string}
          keywords={post.keywords}
        />
      </Suspense>
    </main>
  );
}
