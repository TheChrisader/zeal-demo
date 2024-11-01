import { FetchPostsResponse } from "@/hooks/post/useFetchPosts";
import Trending from "../../(home)/_components/Trending";
import { getPostsByFilters } from "@/database/post/post.repository";
import { connectToDatabase } from "@/lib/database";

const RecommendedArticles = async ({
  headline,
  keywords,
  generic = false,
  domain,
}: {
  headline?: {
    isHeadline: boolean;
    cluster: string;
  };
  generic?: boolean;
  keywords: string[];
  domain?: string;
}) => {
  await connectToDatabase();
  let tags;

  if (generic) {
    const Articles = await getPostsByFilters({
      limit: 8,
      // country: ["Nigeria"],
    });

    return (
      <>
        <h1 className="text-2xl font-bold text-[#2F2D32]">
          You may also like...
        </h1>
        <Trending articles={Articles} />
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
  //       <h1 className="text-2xl font-bold text-[#2F2D32]">Relevant Articles</h1>
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
        <h1 className="text-2xl font-bold text-[#2F2D32]">
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

  const RecommendedArticles = await getPostsByFilters({
    limit: 6,
    keywords: keywords,
  });

  return (
    <>
      <h1 className="text-2xl font-bold text-[#2F2D32]">
        Recommended Articles
      </h1>
      <Trending articles={RecommendedArticles} />
    </>
  );
};

export default RecommendedArticles;
