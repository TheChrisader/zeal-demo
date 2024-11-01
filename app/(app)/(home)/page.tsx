import { headers } from "next/headers";
import { Separator } from "@/components/ui/separator";
import { FetchPostsResponse } from "@/hooks/post/useFetchPosts";
import ArticlesContainer from "./_components/ArticlesContainer";
import Headlines from "./_components/Headlines";
import Trending from "./_components/Trending";
import { connectToDatabase } from "@/lib/database";
import { getPostsByFilters } from "@/database/post/post.repository";
import BookmarkModel from "@/database/bookmark/bookmark.model";
import { validateRequest } from "@/lib/auth/auth";
import PostModel from "@/database/post/post.model";
import { getPreferencesByUserId } from "@/database/preferences/preferences.repository";
import { IPreferences } from "@/types/preferences.type";
import { User } from "lucia";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import ResponsiveHeadlines from "./_components/ResponsiveHeadlines";
import { cleanObject } from "@/utils/cleanObject.utils";

const PostBlock = async ({
  category,
  user,
}: {
  category: string;
  user: User | null;
}) => {
  // const News = await getPostsByFilters({
  //   categories: [category],
  //   limit: 10,
  // });

  const News = await unstable_cache(
    async () => {
      return await getPostsByFilters({
        categories: [category],
        limit: 10,
      });
    },
    [category],
    {
      revalidate: 60 * 60,
      tags: [category],
    },
  )();

  if (user) {
    // const bookmarkedNews = await BookmarkModel.find({
    //   user_id: user?.id,
    //   article_id: { $in: News.map((article) => article._id) },
    // });

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
      <Trending articles={News} partial />
    </ArticlesContainer>
  );
};

const HeadlinesBlock = async ({ user }: { user: User | null }) => {
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
          },
        },
        { $sort: { published_at: -1 } },
        { $sample: { size: 7 } },
      ]);
    },
    ["HEADLINES"],
    {
      revalidate: 60 * 60,
      tags: ["HEADLINES"],
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
  let country: [string];

  // TODO: Add ip location
  /* or, check if env is in dev */
  if (ip != "::1") {
    // set country to nigeria
    country = ["Nigeria"];
  } else {
    // set country to ip location
    country = ["Nigeria"];
  }

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
      <div className="flex flex-wrap gap-3 max-[900px]:flex-col">
        {preferences?.category_updates?.map((category) => {
          return (
            <Suspense key={category}>
              <PostBlock category={category} user={user} />
            </Suspense>
          );
        })}
      </div>
    </main>
  );
}
