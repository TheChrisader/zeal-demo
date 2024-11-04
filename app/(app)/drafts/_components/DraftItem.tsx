import Link from "next/link";
import ArticleTitle from "@/app/(app)/(home)/_components/ArticleTitle";
import { IDraft } from "@/types/draft.type";

interface DraftItemProps {
  draft?: Partial<IDraft>;
  className?: string;
}

export function truncateString(str?: string, num = 91) {
  if (!str) return str;

  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}

const DraftItem = ({ draft, className }: DraftItemProps) => {
  if (!draft?.image_url) {
    return (
      <div
        className={`relative flex h-fit flex-1 rounded-[5px] p-4 shadow-sm transition-transform duration-700 hover:scale-[0.97] hover:shadow-md ${className}`}
      >
        <Link
          href={`/write/${draft?.id}`}
          className={`flex h-fit w-full flex-1 cursor-pointer gap-5 [&_h3]:hover:text-primary [&_h3]:hover:underline`}
        >
          <div className="flex flex-col justify-center">
            <h3 className="text-md mb-2 font-semibold text-[#2F2D32]">
              {truncateString(draft?.title)}
            </h3>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-fit flex-1 rounded-[5px] p-2 shadow-sm transition-transform duration-700 hover:scale-[0.97] hover:shadow-md ${className}`}
    >
      <Link
        href={`/write/${draft?.id}`}
        className={`flex h-fit w-full flex-1 cursor-pointer gap-5 rounded-[5px] [&>div>img]:transition-transform [&>div>img]:duration-1000 [&>div>img]:hover:scale-110 [&_h3]:hover:text-primary [&_h3]:hover:underline`}
      >
        <div className="flex h-[90px] min-w-[200px] max-w-[200px] overflow-hidden rounded-[5px] max-[900px]:min-w-[160px] max-[900px]:max-w-[160px] max-[500px]:min-w-[100px] max-[500px]:max-w-[100px]">
          <img
            src={draft?.image_url}
            alt="draft preview"
            loading="lazy"
            className="h-[90px] min-w-[200px] max-w-[200px] object-cover max-[900px]:min-w-[160px] max-[900px]:max-w-[160px] max-[500px]:min-w-[100px] max-[500px]:max-w-[100px]"
          />
        </div>
        <div className="flex flex-col justify-center">
          <ArticleTitle title={draft?.title as string} />
        </div>
      </Link>
    </div>
  );
};

export default DraftItem;
