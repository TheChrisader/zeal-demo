import { unstable_cache } from "next/cache";
import BookmarkModel from "@/database/bookmark/bookmark.model";
import PostModel from "@/database/post/post.model";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { IPost } from "@/types/post.type";
import ArticleCard from "./ArticleCard";
import ScrollContainer from "./ScrollContainer";

interface TrendingProps {
  articles: IPost[];
  category?: string;
  partial?: boolean;
  query?: boolean;
  filter?: boolean;
}

async function getNextPosts(offset: number, category: string) {
  "use server";
  await connectToDatabase();

  const { user } = await validateRequest();

  const News: IPost[] = await PostModel.find({
    category: {
      $in: [category],
    },
  })
    .sort({ published_at: -1 })
    .skip(offset * 4)
    .limit(4);

  if (user) {
    const bookmarkedNews = await unstable_cache(
      async () => {
        return await BookmarkModel.find({
          user_id: user?.id,
          article_id: { $in: News.map((article) => article._id) },
        });
      },
      [`bookmarks-${user?.id.toString()}`],
      {
        revalidate: 60 * 60,
        tags: [`bookmarks-${user?.id.toString()}`],
      },
    )();

    const bookmarkedNewsIds = new Set(
      bookmarkedNews
        .map((bookmark) => bookmark.article_id)
        .map((id) => id.toString()),
    );

    News.forEach((article) => {
      if (bookmarkedNewsIds.has(article._id!.toString())) {
        article.bookmarked = true;
      }
    });
  }

  return (
    <>
      {News.map((news, index) => {
        return (
          <ArticleCard
            className="min-w-[50%] flex-1 basis-2/5"
            article={news}
            key={index}
          />
        );
      })}
    </>
  );
}

const Trending = ({
  articles,
  category,
  partial = false,
  query = false,
  filter = false,
}: TrendingProps) => {
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
      <div className={`flex flex-wrap gap-5`}>
        <ScrollContainer category={category} loadMoreAction={getNextPosts}>
          {articles.map((_, index) => {
            return (
              <ArticleCard
                className={"min-w-[50%] flex-1 basis-2/5"}
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
    <div className={`flex flex-wrap gap-5`}>
      {articles.map((_, index) => {
        return (
          <ArticleCard
            className={
              "min-w-[calc(40vw-20px)] flex-1 basis-[calc(40vw-20px)] max-[750px]:min-w-full"
            }
            article={articles[index]}
            key={index}
          />
        );
      })}
    </div>
  );
};

export default Trending;
