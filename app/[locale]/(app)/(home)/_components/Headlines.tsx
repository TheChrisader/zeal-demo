import { PostsResponse } from "@/hooks/post/useFetchPosts";
import ArticleCard from "./ArticleCard";
import HeadlineArticle from "./HeadlineArticle";
import ResponsiveHeadlines from "./ResponsiveHeadlines";
import { cleanObject } from "@/utils/cleanObject.utils";

interface HeadlinesProps {
  headlines: PostsResponse[];
}

const Headlines = ({ headlines }: HeadlinesProps) => {
  headlines.forEach((headline) => {
    headline.id = headline._id!.toString();
  });

  const headline = headlines.shift();

  const wideHeadlines = headlines.slice(0, 3);

  return (
    <div className="flex gap-6 max-[900px]:flex-col">
      <div className="flex-1">
        <HeadlineArticle article={headline} />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <ResponsiveHeadlines
          headlines={headlines.map((post) => cleanObject(post))}
        >
          {wideHeadlines.map((_, index) => (
            <ArticleCard
              // className="max-[800px]:min-w-[450px]"
              article={headlines[index]}
              key={index}
            />
          ))}
        </ResponsiveHeadlines>
      </div>
    </div>
  );
};

export default Headlines;
