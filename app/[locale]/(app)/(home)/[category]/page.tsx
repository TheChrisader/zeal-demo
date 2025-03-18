import { getPostsByFilters } from "@/database/post/post.repository";
import { redirect } from "@/i18n/routing";
import { Suspense } from "react";
import { FetchPostsResponse } from "@/hooks/post/useFetchPosts";
import { CATEGORIES, TCategory } from "@/types/utils/category.type";
import { getCategoryFromPath } from "@/utils/path.utils";
import ArticlesContainer from "../_components/ArticlesContainer";
import Trending from "../_components/Trending";
import { connectToDatabase } from "@/lib/database";
import BookmarkModel from "@/database/bookmark/bookmark.model";
import { validateRequest } from "@/lib/auth/auth";
import { findSiblings } from "@/utils/category.utils";
import { IPost } from "@/types/post.type";
import VideoInterface from "./_components/VideoInterface";
import DiscoverPage from "./_components/Discover";

const whitelist = ["headlines"];

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const [pageCategory, pageSubcategory] = getCategoryFromPath(
    "/" + params.category,
  );

  // if (!pageCategory) {
  //   redirect({
  //     href: "/",
  //     locale: "en",
  //   });
  // }

  const { user } = await validateRequest();
  await connectToDatabase();
  const query = searchParams?.query || "";

  const restrictToNG = whitelist.includes(params.category);

  const posts = await getPostsByFilters({
    categories: [pageSubcategory || pageCategory!],
    country: restrictToNG ? ["Nigeria"] : undefined,
    limit: 16,
  });

  const bookmarkedPosts = await BookmarkModel.find({
    user_id: user?.id,
    article_id: { $in: posts.map((article) => article._id) },
  });

  const bookmarkedPostsIds = new Set(
    bookmarkedPosts
      .map((bookmark) => bookmark.article_id)
      .map((id) => id?.toString()),
  );

  posts.forEach((article) => {
    if (bookmarkedPostsIds.has(article._id!.toString())) {
      article.bookmarked = true;
    }
  });

  let subs: string[] = [];
  let subPosts: IPost[][] = [];
  if (pageSubcategory) {
    subs = findSiblings(pageSubcategory);
    subPosts = await Promise.all(
      subs.map(async (sub) => {
        return await getPostsByFilters({
          categories: [sub],
          country: restrictToNG ? ["Nigeria"] : undefined,
          limit: 16,
        });
      }),
    );
  }

  if (pageCategory === "Viral Videos") {
    return <DiscoverPage />;
  }

  return (
    <main className="flex min-h-[calc(100vh-62px)] flex-col">
      <ArticlesContainer title={pageSubcategory || pageCategory!}>
        <Suspense key={query} fallback={<div>Loading...</div>}>
          <Trending articles={posts} />
        </Suspense>
      </ArticlesContainer>
      {subs.map((sub, i) => {
        return (
          <ArticlesContainer key={sub} title={sub}>
            <Suspense key={query} fallback={<div>Loading...</div>}>
              <Trending articles={subPosts[i]!} />
            </Suspense>
          </ArticlesContainer>
        );
      })}
    </main>
  );
}
