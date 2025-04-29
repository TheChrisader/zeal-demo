import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";
import { IPost } from "@/types/post.type";
import { getPublishTimeStamp } from "@/utils/time.utils";

interface HeadlineArticleProps {
  article?: IPost;
}

const HeadlineArticle = ({ article }: HeadlineArticleProps) => {
  return (
    <Link
      href={`/post/${article?.slug}`}
      className="flex flex-col rounded-md p-2 pb-6 hover:shadow-xl [&>div>img]:transition-transform [&>div>img]:duration-1000 [&>div>img]:hover:scale-110 [&_h3]:hover:text-primary [&_h3]:hover:underline"
    >
      <div className="mb-6 overflow-hidden rounded-[15px]">
        <img
          src={article?.image_url || article?.source.icon}
          alt="article preview"
          fetchPriority="high"
          className="h-[190px] w-full object-cover max-[450px]:h-[140px]"
        />
      </div>
      <h3 className="text-foreground-alt mb-4 text-lg font-semibold max-[450px]:text-base">
        {article?.title}
      </h3>
      <div className="flex items-center gap-3">
        <span className="text-muted-alt text-sm font-normal">
          {article?.source.name}
        </span>
        <div className="h-3">
          <Separator orientation="vertical" />
        </div>
        <span className="text-muted-alt text-sm font-normal">
          {getPublishTimeStamp(article?.published_at as string)}
        </span>
        <div className="h-3">
          <Separator orientation="vertical" />
        </div>
        <span className="text-muted-alt text-sm font-normal">
          {article?.ttr} min read
        </span>
      </div>
    </Link>
  );
};

export default HeadlineArticle;
