import { Link } from "@/i18n/routing";
import { IPost } from "@/types/post.type";
import { truncateString } from "@/utils/string.utils";

interface ArticleCardProps {
  article: IPost;
  className?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const imageUrl = article?.image_url || "/placeholder.png";

  return (
    <Link
      href={`/post/${article.slug}`}
      className="w-full overflow-hidden rounded-lg border shadow-sm transition-all duration-700 hover:scale-[0.97] hover:border-primary hover:shadow-md [&_h3]:hover:text-primary [&_h3]:hover:underline"
    >
      <div className="flex">
        {/* Content Section */}
        <div className="flex-1 p-4">
          {/* Category */}
          <div className="mb-2 w-fit rounded-xl bg-primary px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-special-text">
            <span>{article.category[0]}</span>
            {article.category[1] && (
              <>
                <span className="mx-2">•</span>
                <span>{article.category[1]}</span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <h3 className="mb-3 cursor-pointer text-base font-bold leading-tight text-foreground-alt">
              {article.title}
            </h3>

            {/* Image Section */}
            <div className="h-16 w-24 min-w-24 overflow-hidden rounded-md">
              <img
                src={imageUrl}
                alt={article.title}
                loading="lazy"
                fetchPriority="low"
                className="size-full object-cover"
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
