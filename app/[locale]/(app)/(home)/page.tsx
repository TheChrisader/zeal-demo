import { User } from "lucia";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import BookmarkModel from "@/database/bookmark/bookmark.model";
import PostModel from "@/database/post/post.model";
import { getPostsByFilters } from "@/database/post/post.repository";
import { getPreferencesByUserId } from "@/database/preferences/preferences.repository";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { IPreferences } from "@/types/preferences.type";
import ArticlesContainer from "./_components/ArticlesContainer";
import Headlines from "./_components/Headlines";
import HomepageScroll from "./_components/HomepageScroll";
import Trending from "./_components/Trending";
import ScrollContainer from "./_components/ScrollContainer";
import ArticleCard from "./_components/ArticleCard";

function createTimedRandomGenerator(timeout: number) {
  let lastGeneratedValue: number | null = null;
  let lastGeneratedTime = 0;

  return function () {
    const currentTime = Date.now();

    // Check if the last generated value is still valid based on the timeout
    if (
      lastGeneratedValue !== null &&
      currentTime - lastGeneratedTime < timeout
    ) {
      return lastGeneratedValue; // Return the same value if within timeout
    }

    // Generate a new random value
    lastGeneratedValue = Math.random();
    lastGeneratedTime = currentTime; // Update the time of generation
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

const PostBlock = async ({
  category,
  user,
}: {
  category: string;
  user: User | null;
}) => {
  const News = await unstable_cache(
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
      {/* <ScrollContainer> */}
      <Trending articles={News} category={category} partial />
      {/* </ScrollContainer> */}
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

  const HeadlinesPosts = await (async () => {
    return await PostModel.aggregate([
      {
        $match: {
          headline: true,
          image_url: {
            $ne: null,
          },
          country: {
            $in: ["Nigeria"],
          },
        },
      },
      {
        $group: {
          _id: "$cluster_id",
          doc: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$doc",
        },
      },
      {
        $sort: {
          published_at: -1,
        },
      },
      {
        $skip: offset * 5 + 13,
      },
      {
        $limit: 5,
      },
    ]);
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
      <Suspense>
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
      </Suspense>
    </>
  );
};

const HeadlinesBlock = async ({ user }: { user: User | null }) => {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - 5);
  const HeadlinesPosts = await unstable_cache(
    async () => {
      return await PostModel.aggregate([
        {
          $match: {
            headline: true,
            image_url: {
              $ne: null,
            },
            country: {
              $in: ["Nigeria"],
            },
            created_at: {
              $gte: daysAgo,
            },
          },
        },
        {
          $group: {
            _id: "$cluster_id",
            doc: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: {
            newRoot: "$doc",
          },
        },
        {
          $sort: {
            published_at: -1,
          },
        },
        {
          $limit: 13,
        },
      ]);
    },
    ["Headlines"],
    {
      revalidate: 60 * 60,
      tags: ["Headlines"],
    },
  )();

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
    <ArticlesContainer title="Headlines">
      {/* <ResponsiveHeadlines
        headlines={HeadlinesPosts.map((post) => cleanObject(post))}
      > */}
      <Headlines headlines={HeadlinesPosts} />
      {/* </ResponsiveHeadlines> */}
      <Suspense>
        <ScrollContainer
          loadMoreAction={loadMoreHeadlines}
          category="Headlines"
        >
          <></>
        </ScrollContainer>
      </Suspense>
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
  // let country: [string];
  console.log(
    "Cloudflare ip: " + ip + "\n",
    "Client IP (hopefully): ",
    header.get("client-ip") + "\n",
    "CF-Connecting-IP: ",
    header.get("cf-connecting-ip"),
  );

  // TODO: Add ip location
  /* or, check if env is in dev */
  // if (ip != "::1") {
  //   // set country to nigeria
  //   country = ["Nigeria"];
  // } else {
  //   // set country to ip location
  //   country = ["Nigeria"];
  // }

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
      <Suspense>
        <HeadlinesBlock user={user} />
      </Suspense>
      <Separator />
      <HomepageScroll
        currentSelection={preferences!.category_updates!}
        loadMoreAction={loadMoreAction}
      >
        {/* <div className="flex flex-wrap gap-3 max-[900px]:flex-col"> */}
        {(await shuffleArray(preferences?.category_updates))?.map(
          (category) => {
            return (
              <Suspense key={category}>
                <PostBlock category={category} user={user} />
              </Suspense>
            );
          },
        )}
        {/* </div> */}
      </HomepageScroll>
    </main>
  );
}
