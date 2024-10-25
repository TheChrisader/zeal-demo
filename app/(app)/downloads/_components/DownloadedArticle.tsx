import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { getPublishTimeStamp } from "@/utils/time.utils";
import { Button } from "@/components/ui/button";
import AnimateTitle from "../../_components/AnimateTitle";
import { DownloadedPost } from "../[[...id]]/page";
import DLink from "./DLink";

interface DownloadedArticleProps {
  article?: DownloadedPost;
  className?: string;
}

function truncateString(str?: string, num = 91) {
  if (!str) return str;

  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}

const DownloadedArticle = ({ article, className }: DownloadedArticleProps) => {
  if (!article?.image) {
    return (
      <div
        className={`relative flex h-fit flex-1 rounded-[5px] p-4 shadow-sm transition-transform duration-700 hover:scale-[0.97] hover:shadow-md ${className}`}
      >
        <DLink
          to={`/${article?.id}`}
          className={`flex h-fit w-full flex-1 cursor-pointer gap-5 [&_h3]:hover:text-primary [&_h3]:hover:underline`}
        >
          {/* <div
          className="flex h-[90px] min-w-[200px] max-w-[200px] overflow-hidden rounded-[5px]"
          // className="flex h-[90px] min-w-[200px] max-w-[200px]"
        >
          <img
            src={article?.image_url || article?.source.icon}
            alt="article preview"
            loading="lazy"
            className="h-[90px] min-w-[200px] max-w-[200px] object-cover"
          />
        </div> */}
          {/* <img
          src={article?.source.icon}
          alt="article preview"
          loading="lazy"
          className="h-[90px] min-w-[200px] max-w-[200px] rounded-[5px] object-cover"
        /> */}
          <div className="flex flex-col justify-center">
            <AnimateTitle _key={article!.title}>
              <h3 className="text-md mb-2 font-semibold text-[#2F2D32]">
                {truncateString(article?.title)}
              </h3>
            </AnimateTitle>
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
            </div>
          </div>
          {/* <Button
          className="absolute bottom-2 right-2 rounded-full p-3 shadow-lg"
          variant="unstyled"
          size="unstyled"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <BookmarkIcon />
        </Button> */}
        </DLink>
        {/* <BookmarkButton
          id={article?.id as string}
          bookmarked={article?.bookmarked}
        /> */}
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-fit flex-1 rounded-[5px] p-2 shadow-sm transition-transform duration-700 hover:scale-[0.97] hover:shadow-md ${className}`}
    >
      <DLink
        to={`/${article?.id}`}
        className={`flex h-fit w-full flex-1 cursor-pointer gap-5 rounded-[5px] max-[1100px]:flex-col [&>div>img]:transition-transform [&>div>img]:duration-1000 [&>div>img]:hover:scale-110 [&_h3]:hover:text-primary [&_h3]:hover:underline`}
      >
        <div
          className="flex h-[90px] min-w-[200px] max-w-[200px] overflow-hidden rounded-[5px] max-[1100px]:h-[150px] max-[1100px]:w-full max-[1100px]:max-w-full"
          // className="flex h-[90px] min-w-[200px] max-w-[200px]"
        >
          <img
            src={article?.image || article?.source.icon}
            alt="article preview"
            loading="lazy"
            className="h-[90px] min-w-[200px] max-w-[200px] object-cover max-[1100px]:h-[180px] max-[1100px]:w-full max-[1100px]:max-w-full"
          />
        </div>
        {/* <img
        src={article?.image_url || article?.source.icon}
        alt="article preview"
        loading="lazy"
        className="h-[90px] min-w-[200px] max-w-[200px] rounded-[5px] object-cover"
      /> */}
        <div className="flex flex-col justify-center">
          <AnimateTitle _key={article!.title}>
            <h3 className="mb-2 text-sm font-semibold text-[#2F2D32]">
              {truncateString(article?.title)}
            </h3>
          </AnimateTitle>
          <div className="mb-2 flex items-center gap-2">
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
          </div>
          <span className="flex text-xs font-normal text-[#696969]">
            {article?.ttr && `${article?.ttr} min read`}
          </span>
        </div>
      </DLink>
      {/* <BookmarkButton
        id={article?.id as string}
        bookmarked={article?.bookmarked}
      /> */}
    </div>
  );
};

export default DownloadedArticle;
