// import { FetchPostsResponse } from "@/hooks/post/useFetchPosts";
import RecommendedPromotion from "@/components/promotion/recommendation";
import PostModel from "@/database/post/post.model";
import { getPostsByFilters } from "@/database/post/post.repository";
import { connectToDatabase } from "@/lib/database";
import RecommendedContainer from "./RecommendedContainer";
import Trending from "../../(home)/_components/Trending";

const RecommendedArticles = async ({
  // headline,
  keywords,
  generic = false,
  side = false,
  domain,
  id,
}: {
  headline?: {
    isHeadline: boolean;
    cluster: string;
  };
  generic?: boolean;
  side?: boolean;
  keywords: string[];
  domain?: string;
  id?: string;
}) => {
  await connectToDatabase();
  // let tags;

  if (generic) {
    // let Articles = await getPostsByFilters({
    //   limit: 8,
    //   country: ["Nigeria"],
    //   categories: ["Zeal Headline News"],
    // });
    let Articles = await PostModel.find({
      generatedBy: "user",
    })
      .sort({ published_at: -1 })
      .limit(8)
      .lean();

    if (id) {
      Articles = Articles.filter((article) => article._id?.toString() !== id);
    }

    return (
      <>
        <h1 className="mb-4 text-2xl font-bold text-foreground-alt">
          You may also like...
        </h1>
        {side ? (
          <RecommendedContainer partial articles={Articles} />
        ) : (
          <>
            <RecommendedPromotion />
            <Trending articles={Articles} />
          </>
        )}
      </>
    );
  }

  // if (headline) {
  //   const RelevantArticles = await getPostsByFilters({
  //     limit: 6,
  //     cluster: headline.cluster,
  //   });

  //   return (
  //     <>
  //       <h1 className="text-2xl font-bold text-foreground-alt">Relevant Articles</h1>
  //       <Trending articles={RelevantArticles} />
  //     </>
  //   );
  // }

  if (keywords.length === 0) {
    // const MoreArticlesResponse = await fetch(
    //   `http:localhost:3000/api/v1/posts?language=en&size=6&domain=${domain}`,
    //   // TODO: Remove in production
    //   {
    //     next: {
    //       revalidate: 60 * 60 * 8,
    //     },
    //   },
    // );

    // const MoreArticles: FetchPostsResponse = await MoreArticlesResponse.json();

    const MoreArticles = await getPostsByFilters({
      limit: 6,
      domain: domain,
    });

    return (
      <>
        <h1 className="text-2xl font-bold text-foreground-alt">
          More Articles from this Publisher
        </h1>
        <Trending articles={MoreArticles} />
      </>
    );
  }

  // keywords = keywords
  //   .filter((keyword) => !keyword.includes("&"))
  //   .filter((keyword) => !keyword.includes(" "));

  // if (keywords.length > 5) {
  //   keywords = keywords.slice(0, 5);
  //   tags = keywords.join(",");
  // } else {
  //   tags = keywords.join(",");
  // }

  // const keywordsUrl = `&q=${tags}`;

  // const RecommendedArticlesResponse = await fetch(
  //   `http:localhost:3000/api/v1/posts?language=en&size=6${keywordsUrl}`,
  //   // TODO: Remove in production
  //   {
  //     next: {
  //       revalidate: 60 * 60 * 8,
  //     },
  //   },
  // );

  // const RecommendedArticles: FetchPostsResponse =
  //   await RecommendedArticlesResponse.json();

  // let RecommendedArticles = await getPostsByFilters({
  //   limit: 6,
  //   keywords: keywords,
  // });

  const X_DAYS_AGO = new Date();
  X_DAYS_AGO.setDate(X_DAYS_AGO.getDate() - 90);

  let RecommendedArticles = await PostModel.aggregate([
    {
      $match: {
        keywords: {
          $in: keywords,
        },
        created_at: {
          $gte: X_DAYS_AGO,
        },
      },
    },
    // {
    //   $addFields: {
    //     matchCount: {
    //       $size: {
    //         $setIntersection: ["$keywords", keywords],
    //       },
    //     },
    //   },
    // },
    // {
    //   $sort: {
    //     matchCount: -1,
    //   },
    // },
    {
      $limit: 6,
    },
  ]);

  if (id) {
    RecommendedArticles = RecommendedArticles.filter(
      (article) => article._id?.toString() !== id,
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground-alt">
        Recommended Articles
      </h1>
      <Trending articles={RecommendedArticles} />
    </>
  );
};

export default RecommendedArticles;
