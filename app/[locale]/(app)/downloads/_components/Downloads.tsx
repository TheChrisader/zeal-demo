import { DownloadedPost } from "../[[...id]]/page";
import DownloadedArticle from "./DownloadedArticle";

interface DownloadsProps {
  articles: DownloadedPost[];
  partial?: boolean;
}

const Downloads = ({ articles, partial = false }: DownloadsProps) => {
  // TODO
  if (articles.length === 0)
    return <div>There are no results for this search/filter</div>;
  return (
    <div
      className={`flex flex-wrap gap-5 max-[700px]:flex-col ${partial ? "flex-col" : ""}`}
    >
      {articles.map((_, index) => {
        return (
          <DownloadedArticle
            className={
              partial
                ? "w-full"
                : "min-w-[45%] max-w-[50%] max-[700px]:max-w-full"
            }
            article={articles[index]}
            key={index}
          />
        );
      })}
    </div>
  );
};

export default Downloads;
