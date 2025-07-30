"use client";
import { useEffect, useState } from "react";
import AnimateTitle from "@/app/[locale]/(app)/_components/AnimateTitle";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import setupIndexedDB, { useIndexedDBStore } from "@/hooks/useIndexedDB";
import { usePathname } from "@/i18n/routing";
import { cleanContent } from "@/utils/post.utils";
import { getPublishTimeStamp } from "@/utils/time.utils";
import { DownloadedPost } from "../[[...id]]/page";
import { getIDBConfig } from "../_utils/getIDBConfig";

const DownloadedPage = ({ post }: { post: DownloadedPost }) => {
  // const [post, setPost] = useState<DownloadedPost | null>(null);
  const { user } = useAuth();

  //   const path = usePathname();

  useEffect(() => {
    if (!user) {
      return;
    }
    setupIndexedDB(getIDBConfig(user?.id?.toString()!))
      .then(() => console.log("success"))
      .catch((e) => console.error("error / unsupported", e));
  }, [user]);

  // const { getByID } = useIndexedDBStore("posts");

  // useEffect(() => {
  //   const getPost = async () => {
  //     //   const id = path.split("/").pop()!;
  //     const post = (await getByID(Number(id))) as DownloadedPost;
  //     post.content = cleanContent(post.content);
  //     setPost(post);
  //   };
  //   getPost();
  // }, [id]);

  // if (!post) {
  //   return (
  //     <div className="flex h-[calc(100vh-62px)] items-center justify-center text-3xl max-[900px]:px-7">
  //       Post not found
  //     </div>
  //   );
  // }

  return (
    <main className="flex min-h-[calc(100vh-62px)] flex-col gap-6 px-[100px] py-4 max-[900px]:px-7">
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
            <span className="text-xl font-semibold text-foreground-alt">
              {post.source.name!}
            </span>
          </div>
        </div>
        <Separator />
      </div>
      <div className="flex flex-col gap-3">
        <AnimateTitle _key={post!.title}>
          <h1 className="text-2xl font-extrabold text-foreground-alt">
            {post.title}
          </h1>
        </AnimateTitle>
        <div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-normal text-muted-alt">
              Published {getPublishTimeStamp(post.published_at as string)}
            </span>
            <span className="text-sm font-normal text-muted-alt">
              • {post.ttr} minute read
            </span>
          </div>
        </div>
      </div>

      <div
        className="rounded-[20px] p-1 [&_a]:text-blue-500 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:font-bold [&_figure>img]:mb-2 [&_figure>img]:mt-4 [&_figure>img]:max-h-[350px] [&_figure>img]:rounded-md [&_figure>p]:text-black [&_figure]:mb-7 [&_figure]:flex [&_figure]:w-full [&_figure]:flex-col [&_figure]:items-center [&_img]:mx-auto [&_img]:block [&_img]:max-h-[350px] [&_img]:w-1/2 [&_img]:rounded-md [&_img]:object-cover [&_img]:object-center [&_p]:mb-4 [&_p]:max-w-[100vw] [&_p]:text-base [&_p]:font-normal [&_p]:text-muted-alt"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </main>
  );
};

export default DownloadedPage;
