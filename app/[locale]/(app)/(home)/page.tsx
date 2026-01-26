import { Suspense } from "react";
import {
  getTopLevelCategoryList,
  TOP_LEVEL_CATEGORIES,
  TopLevelCategory,
} from "@/categories";
import FrontpagePromotion from "@/components/promotion/frontpage";
import VideoCarousel from "@/components/video/VideoCarousel";
import { connectToDatabase } from "@/lib/database";
import { shuffleArray } from "@/lib/shuffle";
import { getLatestVideos } from "@/services/youtube-rss.service";
import HeadlinesBlock from "./_components/HeadlinesBlock";

const DEFAULT_CATEGORY = "News" as const;

function createHomeConfig(category: TopLevelCategory) {
  return {
    categories: [...getTopLevelCategoryList(category)],
    sort: { prominence_score: -1, published_at: -1 } as const,
    limit: 5,
    filters: { generatedBy: "user" },
    cacheTags: ["frontpage"],
    featuredRevalidate: 60 * 60,
  };
}

export default async function Home() {
  await connectToDatabase();
  const videos = await getLatestVideos(
    "https://www.youtube.com/@ZealNewsAfrica",
  );
  const shuffledCategories = await shuffleArray([...TOP_LEVEL_CATEGORIES]);

  return (
    <main className="flex min-h-[calc(100vh-62px)] flex-col gap-7">
      <VideoCarousel videos={videos} />
      <HeadlinesBlock
        category={DEFAULT_CATEGORY}
        config={createHomeConfig(DEFAULT_CATEGORY as TopLevelCategory)}
      />
      <FrontpagePromotion />
      {shuffledCategories.map((category, i) => (
        <Suspense
          key={`category-${category}`}
          fallback={<div className="h-64 animate-pulse bg-muted" />}
        >
          <HeadlinesBlock
            category={category as TopLevelCategory}
            config={createHomeConfig(category as TopLevelCategory)}
          />
          {(i + 1) % 2 === 0 && <FrontpagePromotion />}
        </Suspense>
      ))}
    </main>
  );
}
