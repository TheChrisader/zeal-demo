import dynamic from "next/dynamic";
import { Separator } from "@/components/ui/separator";
import PostModel from "@/database/post/post.model";
import { connectToDatabase } from "@/lib/database";
import { IPost } from "@/types/post.type";
import PostPage from "./page";
import InfinitePostScroll from "../../_components/InfinitePostScroll";
import ReadMoreWrapper from "../../_components/ReadMoreWrapper";
import RecommendedArticles from "../../_components/RecommendedArticles";
// import DeferInstallPromptEvent from "@/app/(app)/_components/DeferInstallPromptEvent";

const DeferInstallPromptEvent = dynamic(
  () => import("@/app/(app)/_components/DeferInstallPromptEvent"),
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
  const post: IPost = (
    await PostModel.aggregate([
      {
        $match: {
          category: {
            $in: [category],
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
      <InfinitePostScroll loadMoreAction={getNextPost}>
        <ReadMoreWrapper>{children}</ReadMoreWrapper>
        <div className="px-2">
          <RecommendedArticles generic keywords={[]} />
        </div>
      </InfinitePostScroll>
      <DeferInstallPromptEvent />
    </>
  );
};

export default PostLayout;
