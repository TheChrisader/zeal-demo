import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { getPostById } from "@/database/post/post.repository";
import { IPost } from "@/types/post.type";
import { calculateReadingTime, cleanContent } from "@/utils/post.utils";
import { getPublishTimeStamp } from "@/utils/time.utils";
import Comments from "../../_components/Comments";
import RecommendedArticles from "../../_components/RecommendedArticles";
import ShareButton from "../../_components/ShareButton";
import AnimateTitle from "@/app/(app)/_components/AnimateTitle";
import DownloadPost from "../../_components/DownloadPost";
import { connectToDatabase } from "@/lib/database";

export default async function PostPage({
  params,
  subPost,
}: {
  params?: { postId: string };
  subPost?: IPost;
}) {
  await connectToDatabase();
  const article_id: string = params?.postId || subPost!._id!.toString();

  let post: IPost | null;

  if (subPost) {
    post = subPost;
  } else {
    post = await getPostById(article_id);
  }

  if (!post) {
    return (
      <div className="flex h-[calc(100vh-62px)] items-center justify-center text-3xl max-[900px]:px-7">
        Post not found
      </div>
    );
  }

  post.content = cleanContent(post.content);

  return (
    <main className="flex min-h-[calc(100vh-62px)] flex-col gap-6 px-[100px] py-4 max-[900px]:px-7 max-[500px]:px-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {post.source.icon && (
              <div className="rounded-sm bg-gray-300 p-1">
                <img
                  src={post.source.icon}
                  className="h-8 rounded-full"
                  alt="publisher logo"
                />
              </div>
            )}
            <span className="text-xl font-semibold text-[#2F2D32]">
              {post.source.name!}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ShareButton id={article_id} />
            <Link href={`/post/out/${article_id}`}>
              <SquareArrowOutUpRight className="text-[#696969]" />
            </Link>
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
        <Separator />
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-extrabold text-[#2F2D32]">{post.title}</h1>
        <div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-normal text-[#696969]">
              Published {getPublishTimeStamp(post.published_at as string)}
            </span>
            <span className="text-sm font-normal text-[#696969]">
              • {calculateReadingTime(post.content)} minute read
            </span>
          </div>
        </div>
      </div>

      <div
        className="rounded-[20px] p-1 [&_a]:text-blue-500 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:font-bold [&_figure>img]:mb-2 [&_figure>img]:mt-4 [&_figure>img]:max-h-[350px] [&_figure>img]:rounded-md [&_figure>p]:text-black [&_figure]:mb-7 [&_figure]:flex [&_figure]:w-full [&_figure]:flex-col [&_figure]:items-center [&_img]:mx-auto [&_img]:block [&_img]:max-h-[350px] [&_img]:w-1/2 [&_img]:rounded-md [&_img]:object-cover [&_img]:object-center [&_p]:mb-4 [&_p]:max-w-[100vw] [&_p]:text-base [&_p]:font-normal [&_p]:text-[#696969]"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <Separator />
      <Suspense fallback={<div>Loading...</div>}>
        <Comments postID={article_id} />
      </Suspense>
      <Separator />
      <Suspense fallback={<div>Loading...</div>}>
        <RecommendedArticles
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
