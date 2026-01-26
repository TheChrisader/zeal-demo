import { Link } from "@/i18n/routing";
import { IPost } from "@/types/post.type";
import { truncateString } from "@/utils/string.utils";

interface MainArticleCardProps {
  article: IPost;
}

const MainArticleCard: React.FC<MainArticleCardProps> = ({ article }) => {
  if (!article) return null;
  const imageUrl = article?.image_url || "./public/placeholder.png";

  return (
    <article className="overflow-hidden rounded-lg border shadow-sm transition-shadow duration-200 hover:shadow-md [&>div>img]:transition-transform [&>div>img]:duration-1000 [&>div>img]:hover:scale-110 [&_h2]:hover:text-primary [&_h2]:hover:underline">
      <div className="overflow-hidden rounded-md px-6 pb-0 pt-4">
        <img
          src={imageUrl}
          alt="article preview"
          // fetchPriority="high"
          loading="lazy"
          fetchPriority="low"
          className="h-[280px] w-full object-cover max-[450px]:h-[230px]"
        />
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Category and Newsletter Info */}
        <div className="mb-3 flex w-fit items-center rounded-xl bg-primary px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-special-text">
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
        </div>
      </div>
    </article>
  );
};

export default MainArticleCard;
