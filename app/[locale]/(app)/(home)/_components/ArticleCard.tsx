import dynamic from "next/dynamic";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";
import { IPost } from "@/types/post.type";
import { truncateString } from "@/utils/string.utils";
import { getPublishTimeStamp } from "@/utils/time.utils";
import ArticleTitle from "./ArticleTitle";

const BookmarkButton = dynamic(() => import("./BookmarkButton"), {
  ssr: false,
});

interface ArticleCardProps {
  article: IPost;
  className?: string;
}

const ArticleCards = ({ article, className }: ArticleCardProps) => {
  if (!article?.image_url) {
    return (
      <div
        className={`relative flex h-fit flex-1 rounded-[5px] p-4 shadow-sm transition-transform duration-700 hover:scale-[0.97] hover:shadow-md ${className}`}
      >
        <Link
          href={`/post/${article?.slug}`}
          className={`flex h-fit w-full flex-1 cursor-pointer gap-5 [&_h3]:hover:text-primary [&_h3]:hover:underline`}
        >
          <div className="flex flex-col justify-center">
            <h3 className="text-md mb-2 font-semibold text-foreground-alt">
              {truncateString(article?.title)}
            </h3>
            <div className="flex items-center gap-2 max-[400px]:flex-col max-[400px]:items-start">
              <div className="flex items-center gap-2">
                <img
                  className="size-3 rounded-full object-cover"
                  alt="article source icon"
                  src={article?.source.icon}
                />
                <span className="text-xs font-normal text-muted-alt">
                  {article?.source.name}
                </span>
              </div>
              <div className="h-3 max-[400px]:hidden">
                <Separator orientation="vertical" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-normal text-muted-alt">
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
        href={`/post/${article?.slug}`}
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
              className="size-3 rounded-full object-cover"
              alt="Article source Icon"
              src={article?.source.icon}
            />
            <span className="text-xs font-normal text-muted-alt">
              {article?.source.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-normal text-muted-alt">
              {getPublishTimeStamp(article?.published_at as string)}
            </span>
            <div className="h-3">
              <Separator orientation="vertical" />
            </div>
            <span
              // className="absolute left-[40px] top-[0px] flex -translate-x-1/2 rounded-lg bg-card-alt-bg px-4 py-2 text-xs font-normal text-primary"
              className="text-xs font-normal text-primary"
            >
              {article?.ttr && `${article?.ttr} min read`}
            </span>
          </div>
        </div>
      </Link>
      <BookmarkButton
        id={article?.id as string}
        bookmarked={article?.bookmarked}
      />
    </div>
  );
};

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const imageUrl = article?.image_url || "./public/placeholder.png";

  return (
    <Link
      href={`/post/${article.slug}`}
      className="w-full overflow-hidden rounded-lg border shadow-sm transition-all duration-700 hover:scale-[0.97] hover:border-primary hover:shadow-md [&_h3]:hover:text-primary [&_h3]:hover:underline"
    >
      <div className="flex">
        {/* Content Section */}
        <div className="flex-1 p-4">
          {/* Category */}
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
            {article.category[0]}
          </div>

          <div className="flex items-center justify-between gap-2">
            <h3 className="mb-3 cursor-pointer text-base font-bold leading-tight text-foreground-alt">
              {article.title}
            </h3>

            {/* Image Section */}
            <div className="size-12 min-w-12 overflow-hidden rounded-md">
              <img
                src={imageUrl}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            {truncateString(article.description, 120)}
          </p>

          {/* Author Info */}
          <div className="text-xs text-muted-foreground">
            <span>By </span>
            <span className="cursor-pointer font-semibold text-primary hover:underline">
              {article.source.name}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
