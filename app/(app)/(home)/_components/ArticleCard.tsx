import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { PostsResponse } from "@/hooks/post/useFetchPosts";
import { getPublishTimeStamp } from "@/utils/time.utils";
import BookmarkButton from "./BookmarkButton";
import ArticleTitle from "./ArticleTitle";

interface ArticleCardProps {
  article?: PostsResponse;
  className?: string;
}

export function truncateString(str?: string, num = 91) {
  if (!str) return str;

  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}

const ArticleCard = ({ article, className }: ArticleCardProps) => {
  if (!article?.image_url) {
    return (
      <div
        className={`relative flex h-fit flex-1 rounded-[5px] p-4 shadow-sm transition-transform duration-700 hover:scale-[0.97] hover:shadow-md ${className}`}
      >
        <Link
          href={`/post/${article?.id}`}
          className={`flex h-fit w-full flex-1 cursor-pointer gap-5 [&_h3]:hover:text-primary [&_h3]:hover:underline`}
        >
          <div className="flex flex-col justify-center">
            <h3 className="text-md mb-2 font-semibold text-[#2F2D32]">
              {truncateString(article?.title)}
            </h3>
            <div className="flex items-center gap-2">
              <img
                className="size-5 rounded-full object-cover"
                src={article?.source.icon}
              />
              <span className="text-sm font-normal text-[#696969]">
                {article?.source.name}
              </span>
              <div className="h-3">
                <Separator orientation="vertical" />
              </div>
              <span className="text-sm font-normal text-[#696969]">
                {getPublishTimeStamp(article?.published_at as string)}
              </span>
              <div className="h-3">
                <Separator orientation="vertical" />
              </div>
              <span className="flex text-xs font-normal text-primary">
                {article?.ttr && `${article?.ttr} min read`}
              </span>
            </div>
          </div>
        </Link>
        <BookmarkButton
          id={article?.id as string}
          bookmarked={article?.bookmarked}
          imageExists={false}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-fit flex-1 rounded-[5px] p-2 shadow-sm transition-transform duration-700 hover:scale-[0.97] hover:shadow-md ${className}`}
    >
      <Link
        href={`/post/${article?.id}`}
        className={`flex h-fit w-full flex-1 cursor-pointer gap-5 rounded-[5px] [&>div>img]:transition-transform [&>div>img]:duration-1000 [&>div>img]:hover:scale-110 [&_h3]:hover:text-primary [&_h3]:hover:underline`}
      >
        <div className="flex h-[90px] min-w-[200px] max-w-[200px] overflow-hidden rounded-[5px] max-[900px]:min-w-[160px] max-[900px]:max-w-[160px] max-[500px]:min-w-[100px] max-[500px]:max-w-[100px]">
          <img
            src={article?.image_url || article?.source.icon}
            alt="article preview"
            loading="lazy"
            className="h-[90px] min-w-[200px] max-w-[200px] object-cover max-[900px]:min-w-[160px] max-[900px]:max-w-[160px] max-[500px]:min-w-[100px] max-[500px]:max-w-[100px]"
          />
        </div>
        <div className="flex flex-col justify-center">
          <ArticleTitle title={article?.title} />
          <div className="mb-2 flex items-center gap-2">
            <img
              className="size-5 rounded-full object-cover"
              src={article?.source.icon}
            />
            <span className="text-sm font-normal text-[#696969] max-[1000px]:hidden max-[900px]:block max-[430px]:hidden">
              {article?.source.name}
            </span>
            <div className="h-3">
              <Separator orientation="vertical" />
            </div>
            <span className="text-sm font-normal text-[#696969]">
              {getPublishTimeStamp(article?.published_at as string)}
            </span>
          </div>
          <span className="absolute left-[40px] top-[0px] flex -translate-x-1/2 rounded-lg bg-white px-4 py-2 text-xs font-normal text-primary">
            {article?.ttr && `${article?.ttr} min read`}
          </span>
        </div>
      </Link>
      <BookmarkButton
        id={article?.id as string}
        bookmarked={article?.bookmarked}
      />
    </div>
  );
};

export default ArticleCard;
