import SearchInput from "@/components/forms/Input/SearchInput";
import { Separator } from "@/components/ui/separator";

const DraftsBar = () => {
  return (
    <div>
      <div className="my-3 flex w-full items-center gap-5 px-[100px]">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-foreground-alt text-2xl font-bold">Drafts</h1>
        </div>
        <div className="h-8">
          <Separator orientation="vertical" />
        </div>
        <SearchInput placeholder="Search drafts" />
      </div>
    </div>
  );
};

export default DraftsBar;
