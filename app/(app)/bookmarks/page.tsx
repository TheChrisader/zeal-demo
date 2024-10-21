import Link from "next/link";
import BookmarkBar from "./_components/BookmarkBar";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { getBookmarksByUserId } from "@/database/bookmark/bookmark.repository";
import Trending from "../(home)/_components/Trending";
import { getPostsByIds } from "@/database/post/post.repository";

export default async function BookmarksPage() {
  const { user } = await serverAuthGuard();
  const bookmarks = await getBookmarksByUserId(user?.id);
  const posts = await getPostsByIds(
    bookmarks.map((bookmark) => bookmark.article_id as string),
  );

  posts.forEach((post) => {
    post.bookmarked = true;
  });

  // sort the bookmarks by created_at, newest to oldest, then sort the posts according to
  // the order of the bookmarks
  bookmarks.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  posts.sort((a, b) => {
    return (
      bookmarks.findIndex((bookmark) => bookmark.article_id === b.id) -
      bookmarks.findIndex((bookmark) => bookmark.article_id === a.id)
    );
  });

  if (bookmarks.length === 0) {
    return (
      <main className="flex min-h-[calc(100vh-62px)] flex-col gap-7">
        <BookmarkBar />
        <div className="my-auto flex flex-col items-center justify-center gap-9 px-[100px] max-[1024px]:px-7 max-[500px]:px-2">
          <div className="flex flex-col items-center justify-center gap-3">
            <h2 className="text-center text-2xl font-bold text-[#2F2D32]">
              Your bookmarks will appear here
            </h2>
            <span className="max-w-[50vw] text-center text-sm font-normal text-[#696969] max-[500px]:max-w-full">
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
      <BookmarkBar number={bookmarks.length} />
      <div className="mb-3 flex h-fit flex-1 flex-col gap-3 rounded-[20px] px-[100px] py-4 shadow-sm max-[900px]:px-4">
        <Trending articles={posts} />
        {/* <div className="flex flex-col gap-4"></div> */}
      </div>
    </main>
  );
}
