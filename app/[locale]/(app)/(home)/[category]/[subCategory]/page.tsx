import { notFound } from "next/navigation";
import { getCategoryByPath } from "@/categories";
import FrontpagePromotion from "@/components/promotion/frontpage";
import { connectToDatabase } from "@/lib/database";
import HeadlinesBlock from "../../_components/HeadlinesBlock";

const LOAD_MORE_LIMIT = 5;
const INITIAL_HEADLINES_LIMIT = 13;

const loadMoreHeadlines = async (offset: number, category: string) => {
  "use server";

  const { getHeadlinesPosts } = await import("../../_components/HeadlinesBlock");

  const headlinesPosts = await getHeadlinesPosts({
    categories: [category],
    sort: { published_at: -1 },
    limit: LOAD_MORE_LIMIT,
    selectFields: "-content",
  });

  return JSON.parse(JSON.stringify(headlinesPosts));
};

function createSubCategoryConfig(category: string) {
  return {
    categories: [category],
    sort: { published_at: -1 } as const,
    limit: INITIAL_HEADLINES_LIMIT,
    selectFields: "-content",
    featuredRevalidate: 2,
  };
}

export default async function SubCategoryPage({
  params,
}: {
  params: { subCategory: string };
}) {
  await connectToDatabase();

  const category = getCategoryByPath(params.subCategory);

  if (!category) {
    notFound();
  }

  return (
    <main className="flex min-h-[calc(100vh-62px)] flex-col gap-7">
      <HeadlinesBlock
        category={category.name}
        config={createSubCategoryConfig(category.name)}
        loadMoreAction={loadMoreHeadlines}
      />
      <FrontpagePromotion />
    </main>
  );
}
