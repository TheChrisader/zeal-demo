import { User } from "lucia";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { Suspense } from "react";
import BookmarkModel from "@/database/bookmark/bookmark.model";
import PostModel from "@/database/post/post.model";
import { getPostsByFilters } from "@/database/post/post.repository";
import { getPreferencesByUserId } from "@/database/preferences/preferences.repository";
import { validateRequest } from "@/lib/auth/auth";
import { cacheManager } from "@/lib/cache";
import { connectToDatabase } from "@/lib/database";
import { IPreferences } from "@/types/preferences.type";
import ArticleCard from "./_components/ArticleCard";
import ArticlesContainer from "./_components/ArticlesContainer";
import Headlines from "./_components/Headlines";
import HomepageScroll from "./_components/HomepageScroll";
import ScrollContainer from "./_components/ScrollContainer";
import { TodayInHistory } from "./_components/TodayInHistory";
import Trending from "./_components/Trending";
import { IPost } from "@/types/post.type";

const ZEAL_CATEGORIES = [
  // "Zeal Headline News",
  "Zeal Global",
  "Zeal Entertainment",
  "Business 360",
  "Zeal Lifestyle",
  "Zeal Tech",
  "Zeal Sports",
];

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

const ZealPostBlock = async ({ user }: { user: User | null }) => {
  const category = "Zeal News Studio";
  const fetcher = async () => {
    return await getPostsByFilters({
      categories: [category],
      limit: 6,
    });
  };

  const News = await cacheManager({
    fetcher,
    key: category,
    options: {
      revalidate: 60,
    },
  });

  if (user) {
    const bookmarkedNews = await unstable_cache(
      async () => {
        return await BookmarkModel.find({
          user_id: user?.id,
          article_id: { $in: News.map((article) => article._id) },
        });
      },
      [`bookmarks-${user?.id.toString()}`],
      {
        revalidate: 60 * 60,
        tags: [`bookmarks-${user?.id.toString()}`],
      },
    )();

    const bookmarkedNewsIds = new Set(
      bookmarkedNews
        .map((bookmark) => bookmark.article_id)
        .map((id) => id.toString()),
    );

    News.forEach((article) => {
      if (bookmarkedNewsIds.has(article._id!.toString())) {
        article.bookmarked = true;
      }
    });
  }

  return (
    <div className="flex flex-wrap">
      <ArticlesContainer title={category}>
        <Trending articles={News} category={category} />
      </ArticlesContainer>
    </div>
  );
};

const PostBlock = async ({
  category,
  user,
}: {
  category: string;
  user: User | null;
}) => {
  let News = await unstable_cache(
    async () => {
      return await getPostsByFilters({
        categories: [category],
        limit: 4,
      });
    },
    [category],
    {
      revalidate: 60 * 60,
      tags: [category],
    },
  )();

  const date = new Date(new Date().setHours(new Date().getHours() - 2));

  const featured = await cacheManager({
    fetcher: async (): Promise<IPost[]> => {
      return await PostModel.find({
        category: {
          $in: [category],
        },
        image_url: {
          $ne: null,
        },
        top_feature: {
          $gte: date,
        },
      });
    },
    key: category,
    options: {
      revalidate: 2,
    },
  });

  console.log(featured, "!!!!!!!!!!!");

  News = [...featured, ...News];

  if (user) {
    const bookmarkedNews = await unstable_cache(
      async () => {
        return await BookmarkModel.find({
          user_id: user?.id,
          article_id: { $in: News.map((article) => article._id) },
        });
      },
      [`bookmarks-${user?.id.toString()}`],
      {
        revalidate: 60 * 60,
        tags: [`bookmarks-${user?.id.toString()}`],
      },
    )();

    const bookmarkedNewsIds = new Set(
      bookmarkedNews
        .map((bookmark) => bookmark.article_id)
        .map((id) => id.toString()),
    );

    News.forEach((article) => {
      if (bookmarkedNewsIds.has(article._id!.toString())) {
        article.bookmarked = true;
      }
    });
  }

  return (
    <ArticlesContainer title={category}>
      <Trending articles={News} category={category} partial />
    </ArticlesContainer>
  );
};

const loadMoreAction = async (selection: string[]) => {
  "use server";
  const { user } = await validateRequest();

  return selection.map((category) => {
    return (
      <Suspense key={category}>
        <PostBlock category={category} user={user} />
      </Suspense>
    );
  });
};

const loadMoreHeadlines = async (offset: number, category: string) => {
  "use server";

  const { user } = await validateRequest();

  // const preferences: Partial<IPreferences> | null =
  //   await getPreferencesByUserId(user?.id as string);

  const HeadlinesPosts = user
    ? await (async () => {
        return await PostModel.find({
          category: {
            $in: [category],
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
            $in: [category],
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

  if (user) {
    const bookmarkedHeadlinesPosts = await unstable_cache(
      async () => {
        return await BookmarkModel.find({
          user_id: user?.id,
          article_id: { $in: HeadlinesPosts.map((article) => article._id) },
        });
      },
      [`bookmarks-${user?.id.toString()}`],
      {
        revalidate: 60 * 60,
        tags: [`bookmarks-${user?.id.toString()}`],
      },
    )();

    const bookmarkedHeadlinesPostsIds = new Set(
      bookmarkedHeadlinesPosts
        .map((bookmark) => bookmark.article_id)
        .map((id) => id?.toString()),
    );

    HeadlinesPosts.forEach((article) => {
      if (bookmarkedHeadlinesPostsIds.has(article._id.toString())) {
        article.bookmarked = true;
      }
    });
  }

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
  category: string;
}) => {
  const preferences: Partial<IPreferences> | null =
    await getPreferencesByUserId(user?.id as string);

  const countryFilter =
    category === "Headlines"
      ? {
          country: {
            $in: [preferences?.country || "Nigeria"],
          },
        }
      : {};

  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - 5);

  const HeadlinesPosts = user
    ? await unstable_cache(
        async () => {
          return await PostModel.find({
            category: {
              $in: [category],
            },
            image_url: {
              $ne: null,
            },
            // country: {
            //   $in: [preferences?.country || "Nigeria"],
            // },
            ...countryFilter,
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
              $in: [category],
            },
            image_url: {
              $ne: null,
            },
            country: {
              $in: ["Nigeria"],
            },
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

  if (!HeadlinesPosts) {
    return <></>;
  }

  if (user) {
    const bookmarkedHeadlinesPosts = await unstable_cache(
      async () => {
        return await BookmarkModel.find({
          user_id: user?.id,
          article_id: { $in: HeadlinesPosts.map((article) => article._id) },
        });
      },
      [`bookmarks-${user?.id.toString()}`],
      {
        revalidate: 60 * 60,
        tags: [`bookmarks-${user?.id.toString()}`],
      },
    )();

    const bookmarkedHeadlinesPostsIds = new Set(
      bookmarkedHeadlinesPosts
        .map((bookmark) => bookmark.article_id)
        .map((id) => id?.toString()),
    );

    HeadlinesPosts.forEach((article) => {
      if (bookmarkedHeadlinesPostsIds.has(article._id.toString())) {
        article.bookmarked = true;
      }
    });
  }
  return (
    <ArticlesContainer
      title={
        category === "Headlines" ? "News Across Africa" : "Zeal Headline News"
      }
    >
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

  let preferences: Partial<IPreferences> | null = await getPreferencesByUserId(
    user?.id as string,
  );

  if (!preferences) {
    preferences = {
      category_updates: [
        "Politics",
        "Breaking",
        "Celebrity News",
        "Market Watch",
      ],
    };
  }

  const query = searchParams?.query || "";
  const topics = searchParams?.topics || "";
  const sources = searchParams?.sources || "";

  const header = headers();
  const ip = header.get("x-forwarded-for");
  console.log(
    "Cloudflare ip: " + ip + "\n",
    "Client IP (hopefully): ",
    header.get("client-ip") + "\n",
    "CF-Connecting-IP: ",
    header.get("cf-connecting-ip"),
  );

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
      <HeadlinesBlock user={user} category="Zeal Headline News" />
      <TodayInHistory />
      <HeadlinesBlock user={user} category="Headlines" />

      <HomepageScroll
        // currentSelection={preferences!.category_updates!}
        currentSelection={ZEAL_CATEGORIES}
        loadMoreAction={loadMoreAction}
        preferences={preferences.category_updates}
      >
        {(
          await shuffleArray(
            ZEAL_CATEGORIES,
            // preferences?.category_updates?.filter(
            //   (category) => category !== "Viral Videos",
            // ),
          )
        )?.map((category) => {
          return <PostBlock key={category} category={category} user={user} />;
        })}
      </HomepageScroll>
    </main>
  );
}
