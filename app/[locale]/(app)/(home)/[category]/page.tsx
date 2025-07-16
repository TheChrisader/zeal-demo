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
import DiscoverPage from "./_components/Discover";
import VideoFeed from "./_components/VideoFeed"; // Updated import from VideoInterface to VideoFeed
import ArticlesContainer from "../_components/ArticlesContainer";
import Trending from "../_components/Trending";
import ScrollContainer from "../_components/ScrollContainer";
import Headlines from "../_components/Headlines";
import { unstable_cache } from "next/cache";
import { deduplicateByKey } from "@/utils/object.utils";
import Categories, {
  getTopLevelCategoryList,
  TopLevelCategory,
} from "@/categories";
import PostModel from "@/database/post/post.model";
import { cacheManager } from "@/lib/cache";
import { getPreferencesByUserId } from "@/database/preferences/preferences.repository";
import { IPreferences } from "@/types/preferences.type";
import { User } from "lucia";
import ArticleCard from "../_components/ArticleCard";
import { notFound } from "next/navigation";
import Navbar from "./_components/SubNav";

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
  // const preferences: Partial<IPreferences> | null =
  //   await getPreferencesByUserId(user?.id as string);

  // const countryFilter =
  //   category === "Local"
  //     ? {
  //         country: {
  //           $in: [preferences?.country || "Nigeria"],
  //         },
  //       }
  //     : {};

  // const daysAgo = new Date();
  // daysAgo.setDate(daysAgo.getDate() - 5);

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
            generatedBy: "user",
            // country: {
            //   $in: ["Nigeria"],
            // },
          })
            .sort({ published_at: -1 })
            .limit(10)
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
            generatedBy: "user",
            // country: {
            //   $in: ["Nigeria"],
            // },
          })
            .sort({ published_at: -1 })
            .limit(10)
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

  console.log(
    (
      await PostModel.find({
        category: {
          $in: [category],
        },
        image_url: {
          $ne: null,
        },
        generatedBy: "user",
        // country: {
        //   $in: ["Nigeria"],
        // },
      })
        .sort({ published_at: -1 })
        .limit(10)
        .exec()
    ).length,
    "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
  );

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
  await connectToDatabase();
  const { user } = await validateRequest();

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

  // const sub = Categories.find(
  //   (category) =>
  //     category.name.toLowerCase() === params.category.trim().toLowerCase(),
  // )?.sub;

  // if (!sub) {
  //   notFound();
  // }

  const categories = sub.map((category) => category.name).filter(Boolean);

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

  console.log(categories, "This is the category being rendered");

  return (
    <main className="flex min-h-[calc(100vh-62px)] flex-col gap-7">
      <Navbar
        items={sub}
        // activeItem={activeItem}
        // onItemClick={handleNavClick}
      />
      {categories.map((category) => {
        console.log(
          category,
          "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1",
        );
        return (
          <HeadlinesBlock key={category} user={user} category={category} />
        );
      })}
    </main>
  );
}
