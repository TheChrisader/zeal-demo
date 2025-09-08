import { SquareArrowOutUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { extractPath } from "@/categories";
import HTMLParserRenderer from "@/components/custom/ArticleDisplay";
import { NewsletterSignUpForm } from "@/components/layout/NewsletterForm";
import { StickyNewsletterBanner } from "@/components/layout/NewsletterForm/StickyNewsletterBanner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { checkDislike } from "@/database/dislike/dislike.repository";
import { checkLike } from "@/database/like/like.repository";
import { getPostBySlug } from "@/database/post/post.repository";
import { Link } from "@/i18n/routing";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase, newId } from "@/lib/database";
import { IPost } from "@/types/post.type";
import { calculateReadingTime, cleanContent } from "@/utils/post.utils";
import { getPublishTimeStamp } from "@/utils/time.utils";
import Comments from "../_components/Comments";
import DownloadPost from "../_components/DownloadPost";
import Reactions from "../_components/Reactions";
import RecommendedArticles from "../_components/RecommendedArticles";
import ReportDialog from "../_components/ReportDialog";
import ShareButton from "../_components/ShareButton";

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

export default async function PostPage({
  params,
  subPost,
}: {
  params?: { slug: string };
  subPost?: IPost;
}) {
  await connectToDatabase();
  const article_slug: string = params?.slug || subPost!.slug;

  let post: IPost | null;

  if (subPost) {
    post = subPost;
  } else {
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
    like = await checkLike(user.id, newId(article_id));
    dislike = await checkDislike(user.id, newId(article_id));
  }

  if (post.external) {
    post.content = cleanContent(post.content, post.source.url!);
  }

  return (
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
          </div>
        </div>
      )}
      <div className="rounded-[20px] p-1 text-sm [&_img]:mx-auto [&_img]:block [&_img]:rounded-md [&_img]:object-cover [&_img]:object-center">
        <HTMLParserRenderer
          htmlString={`<img
          src="${post.image_url}"
          alt="${post.title}"
        />
        ${post.content}`}
          category={post.category}
        />
      </div>
      <ShareArray title={post.title} />
      <div className="flex w-full items-center justify-end">
        <Reactions reaction={{ like, dislike }} postID={article_id} />
      </div>
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
