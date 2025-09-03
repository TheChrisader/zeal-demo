import { unstable_cache } from "next/cache";
import BookmarkModel from "@/database/bookmark/bookmark.model";
import PostModel from "@/database/post/post.model";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { IPost } from "@/types/post.type";
import RecArticleCard from "./RecArticleCard";
import ScrollContainer from "../../(home)/_components/ScrollContainer";
import RecommendedPromotion from "@/components/promotion/recommendation";

interface RecommendedContainerProps {
  articles: IPost[];
  category?: string;
  partial?: boolean;
  query?: boolean;
  filter?: boolean;
}

async function getNextPosts(offset: number, category: string) {
  "use server";
  await connectToDatabase();

  // const { user } = await validateRequest();

  const News: IPost[] = await PostModel.find({
    category: {
      $in: [category],
    },
  })
    .sort({ published_at: -1 })
    .skip(offset * 4)
    .limit(4);

  // if (user) {
  //   const bookmarkedNews = await unstable_cache(
  //     async () => {
  //       return await BookmarkModel.find({
  //         user_id: user?.id,
  //         article_id: { $in: News.map((article) => article._id) },
  //       });
  //     },
  //     [`bookmarks-${user?.id.toString()}`],
  //     {
  //       revalidate: 60 * 60,
  //       tags: [`bookmarks-${user?.id.toString()}`],
  //     },
  //   )();

  //   const bookmarkedNewsIds = new Set(
  //     bookmarkedNews
  //       .map((bookmark) => bookmark.article_id)
  //       .map((id) => id.toString()),
  //   );

  //   News.forEach((article) => {
  //     if (bookmarkedNewsIds.has(article._id!.toString())) {
  //       article.bookmarked = true;
  //     }
  //   });
  // }

  return (
    <>
      {News.map((_, index) => {
        return (
          <>
            <RecArticleCard
              className={"w-full"}
              article={News[index]}
              key={index}
            />
          </>
        );
      })}
    </>
  );
}

const RecommendedContainer = ({
  articles,
  category,
  partial = false,
  query = false,
  filter = false,
}: RecommendedContainerProps) => {
  // TODO
  if (articles.length === 0) {
    if (query || filter) {
      return (
        <span className="text-lg">There are no results for this search</span>
      );
    }
    return (
      <span className="text-lg">There are no posts under this category.</span>
    );
  }

  if (category) {
    return (
      <div
        className={`flex flex-wrap gap-5 max-[800px]:flex-col ${partial ? "flex-col" : ""}`}
      >
        <ScrollContainer category={category} loadMoreAction={getNextPosts}>
          {articles.map((_, index) => {
            return (
              <RecArticleCard
                className={
                  partial
                    ? "w-full"
                    : "min-w-[45%] max-w-[50%] max-[800px]:max-w-full"
                }
                article={articles[index]}
                key={index}
              />
            );
          })}
        </ScrollContainer>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap gap-5 max-[800px]:flex-col ${partial ? "flex-col" : ""}`}
    >
      {articles.map((_, index) => {
        return (
          <>
            <RecArticleCard
              className={
                partial
                  ? "w-full"
                  : "min-w-[45%] max-w-[50%] max-[800px]:max-w-full"
              }
              article={articles[index]}
              key={index}
            />
            {index === 1 && <RecommendedPromotion />}
          </>
        );
      })}
    </div>
  );
};

export default RecommendedContainer;
