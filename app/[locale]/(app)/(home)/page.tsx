import { XMLParser } from "fast-xml-parser";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import {
  getTopLevelCategoryList,
  TOP_LEVEL_CATEGORIES,
  TopLevelCategory,
} from "@/categories";
import ArticlePromotion from "@/components/promotion/article";
import FrontpagePromotion from "@/components/promotion/frontpage";
import RecommendedPromotion from "@/components/promotion/recommendation";
import VideoCarousel from "@/components/video/VideoCarousel";
import PostModel from "@/database/post/post.model";
import { cacheManager } from "@/lib/cache";
import { connectToDatabase } from "@/lib/database";
import { IPost } from "@/types/post.type";
import { deduplicateByKey } from "@/utils/object.utils";
import ArticleCard from "./_components/ArticleCard";
import ArticlesContainer from "./_components/ArticlesContainer";
import Headlines from "./_components/Headlines";
import ScrollContainer from "./_components/ScrollContainer";

const ZEAL_CATEGORIES = TOP_LEVEL_CATEGORIES;

function createTimedRandomGenerator(timeout: number) {
  let lastGeneratedValue: number | null = null;
  let lastGeneratedTime = 0;

  return function () {
    const currentTime = Date.now();

    if (
      lastGeneratedValue !== null &&
      currentTime - lastGeneratedTime < timeout
    ) {
      return lastGeneratedValue;
    }

    lastGeneratedValue = Math.random();
    lastGeneratedTime = currentTime;
    return lastGeneratedValue;
  };
}

const getCachedShuffler = async () => {
  return await unstable_cache(
    async () => {
      return createTimedRandomGenerator(1000 * 60 * 10)();
    },
    [],
    {
      revalidate: 1000 * 60 * 10,
    },
  )();
};

async function shuffleArray(array?: string[]) {
  if (!array) return [];

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor((await getCachedShuffler()) * (i + 1));
    [array[i], array[j]] = [array[j]!, array[i]!];
  }
  return array;
}

const loadMoreHeadlines = async (offset: number, category: string) => {
  "use server";

  // const preferences: Partial<IPreferences> | null =
  //   await getPreferencesByUserId(user?.id as string);

  const HeadlinesPosts = await (async () => {
    return await PostModel.find({
      category: {
        $in: [...getTopLevelCategoryList(category as TopLevelCategory)],
      },
      // country: {
      //   $in: ["Nigeria"],
      // },
      image_url: {
        $ne: null,
      },
    })
      .sort({
        published_at: -1,
      })
      .skip(offset * 5 + 13)
      .limit(5)
      .exec();
  })();

  return (
    <>
      {HeadlinesPosts.map((article) => {
        article.id = article._id.toString();
        return (
          <ArticleCard
            className={"w-full"}
            article={article}
            key={article._id.toString()}
          />
        );
      })}
    </>
  );
};

const HeadlinesBlock = async ({ category }: { category: TopLevelCategory }) => {
  let HeadlinesPosts: IPost[] = await cacheManager({
    fetcher: async (): Promise<IPost[]> => {
      return await PostModel.find({
        category: {
          $in: [...getTopLevelCategoryList(category)],
        },
        image_url: {
          $ne: null,
        },
        generatedBy: "user",
      })
        .sort({ prominence_score: -1, published_at: -1 })
        .limit(5)
        .select(
          "_id title image_url slug description category ttr source prominence_score",
        )
        .exec();
    },
    key: `${category}-frontpage`,
    options: {
      revalidate: 60 * 60,
      tags: [category, "frontpage"],
    },
  });

  const featureDate = new Date(new Date().setHours(new Date().getHours() - 2));

  const featured = await cacheManager({
    fetcher: async (): Promise<IPost[]> => {
      return await PostModel.find({
        category: {
          $in: [...getTopLevelCategoryList(category)],
        },
        image_url: {
          $ne: null,
        },
        top_feature: {
          $gt: featureDate,
        },
      })
        .sort({ published_at: -1 })
        .select("_id title image_url slug description category ttr source")
        .exec();
    },
    key: `${category}-featured`,
    options: {
      revalidate: 60 * 60,
    },
  });

  HeadlinesPosts = deduplicateByKey([...featured, ...HeadlinesPosts], "_id");

  return (
    <ArticlesContainer title={category}>
      <Headlines headlines={HeadlinesPosts} />
      <ScrollContainer loadMoreAction={loadMoreHeadlines} category={category}>
        <></>
      </ScrollContainer>
    </ArticlesContainer>
  );
};

async function getLatestVideos(
  channelUrl: string,
): Promise<{ id: string; title: string; url: string }[]> {
  // Step 1: Get channelId
  const res = await fetch(channelUrl, { cache: "force-cache" });
  const html = await res.text();
  const match = html.match(/channel_id=([^"]+)/);
  const channelId = match ? match[1] : null;
  if (!channelId) throw new Error("Channel ID not found");

  // Step 2: Fetch RSS feed
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const feedRes = await fetch(feedUrl, {
    next: {
      revalidate: 60 * 60 * 1,
    },
  });
  const xml = await feedRes.text();

  // Step 3: Parse XML
  const parser = new XMLParser();
  const parsed = parser.parse(xml);
  // console.log(parsed, parsed.feed, parsed.feed.entry);

  // Step 4: Map results
  return parsed.feed.entry
    .slice(0, 3)
    .map((entry: { title: string; "yt:videoId": string }) => ({
      id: entry["yt:videoId"],
      title: entry.title,
      url: `https://www.youtube.com/watch?v=${entry["yt:videoId"]}`,
    }));
}

export default async function Home() {
  await connectToDatabase();
  const videos = await getLatestVideos(
    "https://www.youtube.com/@ZealNewsAfrica",
  );

  return (
    <main className="flex min-h-[calc(100vh-62px)] flex-col gap-7">
      <VideoCarousel videos={videos} />
      <HeadlinesBlock category="News" />
      <FrontpagePromotion />
      {(await shuffleArray(ZEAL_CATEGORIES))?.map((category, i) => {
        return (
          <>
            <Suspense key={category}>
              <HeadlinesBlock category={category as TopLevelCategory} />
            </Suspense>
            {(i + 1) % 2 === 0 && <FrontpagePromotion />}
          </>
        );
      })}
    </main>
  );
}
