"use client";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Link } from "@/i18n/routing";
import { IPost } from "@/types/post.type";
import { getPublishTimeStamp } from "@/utils/time.utils";
import ArticleTitle from "./ArticleTitle";
import BookmarkButton from "./BookmarkButton";
import HeadlinesCarousel from "./HeadlinesCarousel";

const ResponsiveHeadlines = ({
  children,
  headlines,
}: {
  children: React.ReactNode;
  headlines: IPost[];
}) => {
  const [carousel, setCarousel] = useState(false);
  const isMobile = useMediaQuery("(max-width: 800px)");

  useEffect(() => {
    setCarousel(isMobile);
  }, [isMobile]);

  if (carousel) {
    return (
      <HeadlinesCarousel>
        {headlines.map((article, index) => {
          return (
            <div
              key={article?._id?.toString()}
              className={`relative flex h-fit min-w-full flex-1 rounded-[5px] p-2 shadow-sm hover:scale-[0.97] hover:shadow-md`}
            >
              <Link
                href={`/post/${article?.slug}`}
                className={`flex h-fit w-full flex-1 cursor-pointer gap-5 rounded-[5px] [&>div>img]:transition-transform [&>div>img]:duration-1000 [&>div>img]:hover:scale-110 [&_h3]:hover:text-primary [&_h3]:hover:underline`}
              >
                <div className="flex h-[90px] min-w-[200px] max-w-[200px] overflow-hidden rounded-[5px] max-[900px]:min-w-[160px] max-[900px]:max-w-[160px] max-[500px]:min-w-[100px] max-[500px]:max-w-[100px]">
                  <img
                    src={article?.image_url || article?.source.icon}
                    alt="article preview"
                    loading={index === 0 ? "eager" : "lazy"}
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
                    <span className="text-muted-alt text-xs font-normal">
                      {article?.source.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-alt text-xs font-normal">
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
                id={article?._id?.toString() as string}
                bookmarked={article?.bookmarked}
              />
            </div>
          );
        })}
      </HeadlinesCarousel>
    );
  }

  return <>{children}</>;
};

export default ResponsiveHeadlines;
