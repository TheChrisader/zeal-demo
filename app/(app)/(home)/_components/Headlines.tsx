import { PostsResponse } from "@/hooks/post/useFetchPosts";
import ArticleCard from "./ArticleCard";
import HeadlineArticle from "./HeadlineArticle";

interface HeadlinesProps {
  headlines: PostsResponse[];
}

const Headlines = ({ headlines }: HeadlinesProps) => {
  headlines.forEach((headline) => {
    headline.id = headline._id!.toString();
  });

  const headline = headlines.shift();

  return (
    <div className="flex gap-6 max-[900px]:flex-col">
      <div className="flex-1">
        <HeadlineArticle article={headline} />
      </div>
      <div className="max-[800px]:scrollbar-change flex flex-1 flex-col gap-2 max-[800px]:flex-row max-[800px]:overflow-auto">
        {headlines.map((_, index) => (
          <ArticleCard
            className="max-[800px]:min-w-[450px]"
            article={headlines[index]}
            key={index}
          />
        ))}
      </div>
    </div>
  );
};

export default Headlines;
