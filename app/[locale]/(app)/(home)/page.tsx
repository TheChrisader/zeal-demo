import { User } from "lucia";
import { unstable_cache } from "next/cache";
import BookmarkModel from "@/database/bookmark/bookmark.model";
import PostModel from "@/database/post/post.model";
import { getPostsByFilters } from "@/database/post/post.repository";
import { validateRequest } from "@/lib/auth/auth";
import { cacheManager } from "@/lib/cache";
import { connectToDatabase } from "@/lib/database";
import ArticleCard from "./_components/ArticleCard";
import ArticlesContainer from "./_components/ArticlesContainer";
import Headlines from "./_components/Headlines";
import ScrollContainer from "./_components/ScrollContainer";
import { TodayInHistory } from "./_components/TodayInHistory";
import Trending from "./_components/Trending";
import { IPost } from "@/types/post.type";
import {
  getTopLevelCategoryList,
  TOP_LEVEL_CATEGORIES,
  TopLevelCategory,
} from "@/categories";
import { deduplicateByKey } from "@/utils/object.utils";

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

  const { user } = await validateRequest();

  // const preferences: Partial<IPreferences> | null =
  //   await getPreferencesByUserId(user?.id as string);

  const HeadlinesPosts = user
    ? await (async () => {
        return await PostModel.find({
          category: {
            $in: [...getTopLevelCategoryList(category as TopLevelCategory)],
          },
          // country: {
          //   $in: [preferences?.country || "Nigeria"],
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
      })()
    : await (async () => {
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

const HeadlinesBlock = async ({
  user,
  category,
}: {
  user: User | null;
  category: TopLevelCategory;
}) => {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - 5);

  let HeadlinesPosts: IPost[] = user
    ? await unstable_cache(
        async () => {
          return await PostModel.find({
            category: {
              $in: [...getTopLevelCategoryList(category)!],
            },
            image_url: {
              $ne: null,
            },
            // ...countryFilter,
            created_at: {
              $gte: daysAgo,
            },
          })
            .sort({ published_at: -1 })
            .limit(13)
            .exec();
        },
        [`${category}-${user?.id.toString()}`],
        {
          revalidate: 60 * 60,
          tags: [`${category}-${user?.id.toString()}`],
        },
      )()
    : await unstable_cache(
        async () => {
          return await PostModel.find({
            category: {
              $in: [...getTopLevelCategoryList(category)],
            },
            image_url: {
              $ne: null,
            },
            // country: {
            //   $in: ["Nigeria"],
            // },
            created_at: {
              $gte: daysAgo,
            },
          })
            .sort({ published_at: -1 })
            .limit(13)
            .exec();
        },
        [category],
        {
          revalidate: 60 * 60,
          tags: [category],
        },
      )();

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
      });
    },
    key: `${category}-featured`,
    options: {
      revalidate: 2,
    },
  });

  const prioritizedDate = new Date(
    new Date().setHours(new Date().getHours() - 1000),
  );

  const prioritizedUser = await cacheManager({
    fetcher: async (): Promise<IPost[]> => {
      return await PostModel.find({
        category: {
          $in: [...getTopLevelCategoryList(category)],
        },
        image_url: {
          $ne: null,
        },
        generatedBy: "user",
        published_at: {
          $gt: prioritizedDate,
        },
      }).limit(8);
    },
    key: `${category}-user`,
    options: {
      revalidate: 60 * 60,
    },
  });

  const prioritizedZeal = await cacheManager({
    fetcher: async (): Promise<IPost[]> => {
      return await PostModel.find({
        category: {
          $in: [...getTopLevelCategoryList(category)],
        },
        image_url: {
          $ne: null,
        },
        generatedBy: "zeal",
        published_at: {
          $gt: prioritizedDate,
        },
      }).limit(5);
    },
    key: `${category}-zeal`,
    options: {
      revalidate: 60 * 60,
    },
  });

  HeadlinesPosts = deduplicateByKey(
    [...featured, ...prioritizedUser, ...prioritizedZeal, ...HeadlinesPosts],
    "_id",
  );

  return (
    <ArticlesContainer title={category}>
      <Headlines headlines={HeadlinesPosts} />
      <ScrollContainer loadMoreAction={loadMoreHeadlines} category={category}>
        <></>
      </ScrollContainer>
    </ArticlesContainer>
  );
};

export default async function Home({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
    topics?: string;
    sources?: string;
  };
}) {
  await connectToDatabase();
  const { user } = await validateRequest();

  const query = searchParams?.query || "";
  const topics = searchParams?.topics || "";
  const sources = searchParams?.sources || "";

  if (query || topics || sources) {
    const articles = await getPostsByFilters({
      query: query,
      categories: topics.split(","),
      limit: 20,
      // country: country,
    });

    const bookmarkedArticles = await BookmarkModel.find({
      user_id: user?.id,
      article_id: { $in: articles.map((article) => article._id) },
    });

    const bookmarkedArticlesIds = new Set(
      bookmarkedArticles
        .map((bookmark) => bookmark.article_id)
        .map((id) => id.toString()),
    );

    articles.forEach((article) => {
      if (bookmarkedArticlesIds.has(article._id!.toString())) {
        article.bookmarked = true;
      }
    });

    const title = query ? `Search Results for "${query}"` : "Filtered Results";
    return (
      <main className="flex flex-col">
        <div className="max-[900px]:flex-col">
          <ArticlesContainer title={title}>
            <Trending articles={articles} />
          </ArticlesContainer>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-62px)] flex-col gap-7">
      <HeadlinesBlock user={user} category="News" />
      <TodayInHistory />
      {(await shuffleArray(ZEAL_CATEGORIES))?.map((category) => {
        return (
          <HeadlinesBlock
            key={category}
            user={user}
            category={category as TopLevelCategory}
          />
        );
      })}
    </main>
  );
}
