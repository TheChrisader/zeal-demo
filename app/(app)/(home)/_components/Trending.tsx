import { PostsResponse } from "@/hooks/post/useFetchPosts";
import ArticleCard from "./ArticleCard";

interface TrendingProps {
  articles: PostsResponse[];
  partial?: boolean;
  query?: boolean;
  filter?: boolean;
}

const Trending = ({
  articles,
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
  return (
    <div
      className={`flex flex-wrap gap-5 max-[800px]:flex-col ${partial ? "flex-col" : ""}`}
    >
      {articles.map((_, index) => {
        return (
          <ArticleCard
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
    </div>
  );
};

export default Trending;
