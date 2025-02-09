import dynamic from "next/dynamic";
import { Separator } from "@/components/ui/separator";
import PostModel from "@/database/post/post.model";
import { connectToDatabase } from "@/lib/database";
import { IPost } from "@/types/post.type";
import PostPage from "./page";
import InfinitePostScroll from "../_components/InfinitePostScroll";
import ReadMoreWrapper from "../_components/ReadMoreWrapper";
import RecommendedArticles from "../_components/RecommendedArticles";
// import DeferInstallPromptEvent from "@/app/[locale]/(app)/_components/DeferInstallPromptEvent";

const DeferInstallPromptEvent = dynamic(
  () => import("@/app/[locale]/(app)/_components/DeferInstallPromptEvent"),
  { ssr: false },
);

async function getNextPost() {
  "use server";
  await connectToDatabase();
  const categoryList = [
    "Headlines",
    "Breaking",
    "Politics",
    "Top US News",
    "Top Movies",
  ];
  const category =
    categoryList[Math.floor(Math.random() * categoryList.length)];

  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - 2);

  const post: IPost = (
    await PostModel.aggregate([
      {
        $match: {
          category: {
            $in: [category],
          },
          created_at: {
            $gte: daysAgo,
          },
        },
      },
      {
        $sample: {
          size: 1,
        },
      },
    ])
  ).pop()!;

  return (
    <>
      <Separator />
      <ReadMoreWrapper>
        <PostPage subPost={post} />
      </ReadMoreWrapper>
    </>
  );
}

const PostLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <main className="flex justify-between">
        <InfinitePostScroll loadMoreAction={getNextPost}>
          <ReadMoreWrapper>{children}</ReadMoreWrapper>
          <div className="hidden px-2 max-[750px]:block">
            <RecommendedArticles generic keywords={[]} />
          </div>
        </InfinitePostScroll>
        <div className="scrollbar-change sticky top-[76px] mt-4 max-h-[calc(100vh-76px)] w-[30vw] overflow-y-auto pr-4 max-[750px]:hidden">
          <RecommendedArticles generic side keywords={[]} />
        </div>
      </main>
      <DeferInstallPromptEvent />
    </>
  );
};

export default PostLayout;
