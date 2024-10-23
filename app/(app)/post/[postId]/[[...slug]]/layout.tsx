import { Separator } from "@/components/ui/separator";
import PostModel from "@/database/post/post.model";
import { IPost } from "@/types/post.type";
import PostPage from "./page";
import InfinitePostScroll from "../../_components/InfinitePostScroll";
import ReadMoreWrapper from "../../_components/ReadMoreWrapper";
import RecommendedArticles from "../../_components/RecommendedArticles";
import { connectToDatabase } from "@/lib/database";

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
        <RecommendedArticles generic keywords={[]} />
      </InfinitePostScroll>
    </>
  );
};

export default PostLayout;
