import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";
import { IPost } from "@/types/post.type";
import { truncateString } from "@/utils/string.utils";
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
      <h3 className="mb-4 text-lg font-semibold text-foreground-alt max-[450px]:text-base">
        {article?.title}
      </h3>
      <div className="flex items-center gap-3">
        <span className="text-sm font-normal text-muted-alt">
          {article?.source.name}
        </span>
        <div className="h-3">
          <Separator orientation="vertical" />
        </div>
        <span className="text-sm font-normal text-muted-alt">
          {getPublishTimeStamp(article?.published_at as string)}
        </span>
        <div className="h-3">
          <Separator orientation="vertical" />
        </div>
        <span className="text-sm font-normal text-muted-alt">
          {article?.ttr} min read
        </span>
      </div>
    </Link>
  );
};

interface MainArticleCardProps {
  article: IPost;
}

const MainArticleCard: React.FC<MainArticleCardProps> = ({ article }) => {
  if (!article) return null;
  const imageUrl = article?.image_url || "./public/placeholder.png";

  return (
    <article className="overflow-hidden rounded-lg border shadow-sm transition-shadow duration-200 hover:shadow-md [&>div>img]:transition-transform [&>div>img]:duration-1000 [&>div>img]:hover:scale-110 [&_h2]:hover:text-primary [&_h2]:hover:underline">
      {/* Image Section */}
      {/* <div className="relative h-80 w-full overflow-hidden md:h-96">
        <img
          src={imageUrl}
          alt={article.title}
          className="h-full w-full object-cover"
        />
      </div> */}
      <div className="overflow-hidden rounded-md px-6 pb-0 pt-4">
        <img
          src={imageUrl}
          alt="article preview"
          fetchPriority="high"
          className="h-[280px] w-full object-cover max-[450px]:h-[230px]"
        />
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Category and Newsletter Info */}
        <div className="mb-3 flex items-center text-xs font-semibold uppercase tracking-wide text-primary">
          <span>{article.category[0]}</span>
          {article.category[1] && (
            <>
              <span className="mx-2">•</span>
              <span>{article.category[1]}</span>
            </>
          )}
        </div>

        <Link href={`/post/${article.slug}`}>
          <h2 className="mb-4 text-base font-bold leading-tight text-foreground-alt md:text-lg">
            {article.title}
          </h2>
        </Link>

        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {truncateString(article.description, 400)}
        </p>

        {/* Article Preview */}
        <div className="mb-6">
          {/* <p className="mb-4 leading-relaxed text-gray-800">
            The world&apos;s richest man — who before his explosive fallout with
            President Trump said he&apos;d do a lot less political spending
            moving forward — became a GOP mega-donor last year. Now, the
            billionaire seems intent on carving a new political path.
          </p> */}

          {/* CTA Button */}
          <Link
            href={`/post/${article.slug}`}
            className="flex w-full items-center justify-center space-x-2 rounded-full border border-gray-700/60 px-6 py-3 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-primary"
          >
            <span>Read More ({article.ttr} min. read)</span>
            <span>→</span>
          </Link>
        </div>

        {/* Author Info */}
        <div className="flex gap-2 text-sm text-primary">
          <div>
            <img
              className="size-4 rounded-full object-cover"
              alt="article source icon"
              src={article?.source.icon}
            />
          </div>
          <span className="cursor-pointer font-semibold">
            {article.source?.name?.toUpperCase()}
          </span>
          {/* {article.category.length > 1 && article.category[1] && (
            <>
              <span> and </span>
              <span className="cursor-pointer font-semibold text-blue-600 hover:underline">
                CAMERON PETERS
              </span>
            </>
          )} */}
        </div>
      </div>
    </article>
  );
};

export default MainArticleCard;
