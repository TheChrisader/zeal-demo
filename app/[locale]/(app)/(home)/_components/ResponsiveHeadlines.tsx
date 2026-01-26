"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Link } from "@/i18n/routing";
import { IPost } from "@/types/post.type";
import { getPublishTimeStamp } from "@/utils/time.utils";
import ArticleTitle from "./ArticleTitle";

// import HeadlinesCarousel from "./HeadlinesCarousel";
const HeadlinesCarousel = dynamic(() => import("./HeadlinesCarousel"));

const ResponsiveHeadlines = ({
  children,
  headlines,
}: {
  children: React.ReactNode;
  headlines: IPost[];
}) => {
  const [isInView, setIsInView] = useState(false);
  const [carousel, setCarousel] = useState(false);
  const placeholderRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery("(max-width: 800px)");

  useEffect(() => {
    setCarousel(isMobile);
  }, [isMobile]);

  useEffect(() => {
    const refObject = placeholderRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        // entries.forEach((entry) => {
        //   if (entry.isIntersecting) {
        //     setIsInView(true);
        //     observer.disconnect(); // Stop observing once it's visible
        //   }
        // });
        // If the placeholder is intersecting the viewport, load the real component
        if (entries[0]?.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Stop observing once it's visible
        }
      },
      { rootMargin: "200px" }, // Optional: Load it when it's 200px away from the viewport
    );

    if (placeholderRef.current) {
      observer.observe(placeholderRef.current);
    }

    return () => {
      // if (placeholderRef.current) {
      if (refObject) {
        // observer.unobserve(placeholderRef.current);
        observer.unobserve(refObject);
      }
    };
  }, [carousel]);

  if (carousel) {
    return (
      <div
        ref={placeholderRef}
        //  style={{ minHeight: "300px", width: "100%" }}
      >
        {isInView && (
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
                </div>
              );
            })}
          </HeadlinesCarousel>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default ResponsiveHeadlines;
