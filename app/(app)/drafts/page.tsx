import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import Link from "next/link";
import DraftsBar from "./_components/DraftsBar";

const DraftsPage = async () => {
  const { user } = await serverAuthGuard();
  const drafts = [];

  if (drafts.length === 0) {
    return (
      <main className="flex min-h-[calc(100vh-62px)] flex-col gap-7">
        <DraftsBar />
        <div className="my-auto flex flex-col items-center justify-center gap-9 px-[100px]">
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-2xl font-bold text-[#2F2D32]">
              Your drafts will appear here
            </h2>
            <span className="max-w-[50vw] text-center text-sm font-normal text-[#696969]">
              Enim tempus tincidunt et facilisis amet et feugiat. Scelerisque at
              eget sed auctor non eget rhoncus. Morbi sit sumassa quis a. Velit.
            </span>
          </div>
          <Link
            className="flex h-[35px] w-[138px] items-center justify-center rounded-[30px] bg-[#2F7830] px-[10px] py-[5px] text-sm font-normal text-white shadow-basic"
            href={"/"}
          >
            Return to Feed
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-62px)] flex-col gap-3">
      {/* <BookmarkBar number={bookmarks.length} />
      <div className="mb-3 flex h-fit flex-1 flex-col gap-3 rounded-[20px] bg-white px-[100px] py-4 shadow-sm">
        <Trending articles={posts} />
      </div> */}
    </main>
  );
};

export default DraftsPage;
