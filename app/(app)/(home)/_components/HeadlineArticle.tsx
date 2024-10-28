import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { PostsResponse } from "@/hooks/post/useFetchPosts";
import { getPublishTimeStamp } from "@/utils/time.utils";

interface HeadlineArticleProps {
  article?: PostsResponse;
}

const HeadlineArticle = ({ article }: HeadlineArticleProps) => {
  return (
    <Link
      href={`/post/${article?.id}`}
      className="flex flex-col rounded-md p-2 pb-6 hover:shadow-xl [&>div>img]:transition-transform [&>div>img]:duration-1000 [&>div>img]:hover:scale-110 [&_h3]:hover:text-primary [&_h3]:hover:underline"
    >
      <div className="mb-6 overflow-hidden rounded-[15px]">
        <img
          src={article?.image_url || article?.source.icon}
          alt="article preview"
          fetchPriority="high"
          className="h-[190px] w-full object-cover"
        />
      </div>
      <h3 className="mb-4 text-lg font-semibold text-[#2F2D32]">
        {article?.title}
      </h3>
      <div className="flex items-center gap-3">
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
        <span className="text-sm font-normal text-[#696969]">
          {article?.ttr} min read
        </span>
      </div>
    </Link>
  );
};

export default HeadlineArticle;
