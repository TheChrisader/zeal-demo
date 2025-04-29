import SearchInput from "@/components/forms/Input/SearchInput";
import { Separator } from "@/components/ui/separator";

const BookmarkBar = ({ number = 0 }: { number?: number }) => {
  return (
    <div>
      <div className="my-3 flex w-full items-center gap-5 px-[100px] max-[900px]:flex-col max-[900px]:gap-2 max-[900px]:px-7">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-foreground-alt text-2xl font-bold">Bookmarks</h1>
          <span className="text-muted-alt text-sm font-normal">({number})</span>
        </div>
        <div className="h-8 max-[900px]:hidden">
          <Separator orientation="vertical" />
        </div>
        <Separator className="hidden max-[900px]:block" />
        <SearchInput placeholder="Search bookmarks" />
      </div>
    </div>
  );
};

export default BookmarkBar;
