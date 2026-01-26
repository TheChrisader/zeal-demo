import { notFound } from "next/navigation";
import React from "react";
import Categories from "@/categories";
import FrontpagePromotion from "@/components/promotion/frontpage";
import { connectToDatabase } from "@/lib/database";
import Navbar from "./_components/SubNav";
import HeadlinesBlock from "../_components/HeadlinesBlock";

const LOAD_MORE_LIMIT = 5;
const INITIAL_HEADLINES_LIMIT = 10;

const loadMoreHeadlines = async (offset: number, category: string) => {
  "use server";

  const { getHeadlinesPosts } = await import("../_components/HeadlinesBlock");

  const headlinesPosts = await getHeadlinesPosts({
    categories: [category],
    sort: { published_at: -1 },
    limit: LOAD_MORE_LIMIT,
    selectFields: "-content",
  });

  return JSON.parse(JSON.stringify(headlinesPosts));
};

function createCategoryConfig(category: string) {
  return {
    categories: [category],
    sort: { published_at: -1 } as const,
    limit: INITIAL_HEADLINES_LIMIT,
    selectFields: "-content",
    featuredRevalidate: 2,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  await connectToDatabase();

  const foundCategory = Categories.find(
    (category) =>
      category.name.toLowerCase() === params.category.trim().toLowerCase(),
  );

  if (!foundCategory) {
    notFound();
  }

  let sub = [foundCategory];

  if (foundCategory.sub) {
    sub = foundCategory.sub;
  }

  const categories = sub.map((category) => category.name).filter(Boolean);

  return (
    <main className="flex min-h-[calc(100vh-62px)] flex-col gap-7">
      <Navbar items={sub} />
      {categories.map((category, i) => (
        <React.Fragment key={category}>
          <HeadlinesBlock
            category={category}
            config={createCategoryConfig(category)}
            loadMoreAction={loadMoreHeadlines}
          />
          {i % 2 === 0 && <FrontpagePromotion />}
        </React.Fragment>
      ))}
    </main>
  );
}
