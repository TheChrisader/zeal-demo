import { Suspense } from "react";
import BookmarkModel from "@/database/bookmark/bookmark.model";
import { getPostsByFilters } from "@/database/post/post.repository";
import { redirect } from "@/i18n/routing";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { IPost } from "@/types/post.type";
import { CATEGORIES, TCategory } from "@/types/utils/category.type";
import { findSiblings } from "@/utils/category.utils";
import { getCategoryFromPath } from "@/utils/path.utils";
import DiscoverPage from "../_components/Discover";
import VideoFeed from "../_components/VideoFeed"; // Updated import from VideoInterface to VideoFeed
import ArticlesContainer from "../../_components/ArticlesContainer";
import Trending from "../../_components/Trending";
import ScrollContainer from "../../_components/ScrollContainer";
import Headlines from "../../_components/Headlines";
import { unstable_cache } from "next/cache";
import { deduplicateByKey } from "@/utils/object.utils";
import Categories, {
  getCategoryByPath,
  getTopLevelCategoryList,
} from "@/categories";
import PostModel from "@/database/post/post.model";
import { cacheManager } from "@/lib/cache";
import { getPreferencesByUserId } from "@/database/preferences/preferences.repository";
import { IPreferences } from "@/types/preferences.type";
import { User } from "lucia";
import ArticleCard from "../../_components/ArticleCard";
import { notFound } from "next/navigation";
import { isFirstDayOfMonth } from "date-fns";

const whitelist = ["headlines"];

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
  if (!category) return null;
  const preferences: Partial<IPreferences> | null =
    await getPreferencesByUserId(user?.id as string);

  const countryFilter =
    category === "Local"
      ? {
          country: {
            $in: [preferences?.country || "Nigeria"],
          },
        }
      : {};

  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - 5);

  let HeadlinesPosts: IPost[] = user
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

  if (!HeadlinesPosts) {
    return <></>;
  }

  const featureDate = new Date(new Date().setHours(new Date().getHours() - 2));

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
    new Date().setHours(new Date().getHours() - 8),
  );

  const prioritizedUser = await cacheManager({
    fetcher: async (): Promise<IPost[]> => {
      return await PostModel.find({
        category: {
          $in: [category],
        },
        image_url: {
          $ne: null,
        },
        generatedBy: "user",
        published_at: {
          $gt: prioritizedDate,
        },
      }).limit(5);
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
          $in: [category],
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
      if (bookmarkedHeadlinesPostsIds.has(article._id!.toString())) {
        article.bookmarked = true;
      }
    });
  }
  return (
    <ArticlesContainer title={category}>
      <Headlines headlines={HeadlinesPosts} />
      <ScrollContainer loadMoreAction={loadMoreHeadlines} category={category}>
        <></>
      </ScrollContainer>
    </ArticlesContainer>
  );
};

export default async function SubCategoryPage({
  params,
  searchParams,
}: {
  params: { subCategory: string };
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  await connectToDatabase();
  const { user } = await validateRequest();

  const category = getCategoryByPath(params.subCategory);
  console.log(category, "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

  if (!category) {
    notFound();
  }

  // return (
  //   <main className="flex min-h-[calc(100vh-62px)] flex-col">
  //     <ArticlesContainer title={pageSubcategory || pageCategory!}>
  //       <Suspense key={query} fallback={<div>Loading...</div>}>
  //         <Trending articles={posts} />
  //       </Suspense>
  //     </ArticlesContainer>
  //     {subs.map((sub, i) => {
  //       return (
  //         <ArticlesContainer key={sub} title={sub}>
  //           <Suspense key={query} fallback={<div>Loading...</div>}>
  //             <Trending articles={subPosts[i]!} />
  //           </Suspense>
  //         </ArticlesContainer>
  //       );
  //     })}
  //   </main>
  // );

  return (
    <main className="flex min-h-[calc(100vh-62px)] flex-col gap-7">
      <HeadlinesBlock user={user} category={category.name} />
    </main>
  );
}
