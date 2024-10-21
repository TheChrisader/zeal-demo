import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FetchPostsResponse } from "@/hooks/post/useFetchPosts";
import { CATEGORIES, TCategory } from "@/types/utils/category.type";
import { getCategoryFromPath } from "@/utils/path.utils";
import ArticlesContainer from "../_components/ArticlesContainer";
import Trending from "../_components/Trending";
import { getPostsByFilters } from "@/database/post/post.repository";
import { connectToDatabase } from "@/lib/database";
import BookmarkModel from "@/database/bookmark/bookmark.model";
import { validateRequest } from "@/lib/auth/auth";

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

  if (!pageCategory) {
    redirect("/");
  }

  const { user } = await validateRequest();
  await connectToDatabase();
  const query = searchParams?.query || "";

  const restrictToNG = whitelist.includes(params.category);

  const posts = await getPostsByFilters({
    query: query,
    categories: [pageSubcategory || pageCategory],
    country: restrictToNG ? ["Nigeria"] : undefined,
    // authors: sources.split(",").filter((source) => source !== ""),
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

  return (
    <main className="flex min-h-[calc(100vh-62px)] flex-col">
      <ArticlesContainer title={pageSubcategory || pageCategory}>
        <Suspense key={query} fallback={<div>Loading...</div>}>
          <Trending articles={posts} />
        </Suspense>
      </ArticlesContainer>
    </main>
  );
}
