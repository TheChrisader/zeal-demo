// fetch from every category
// properly format every article
// mass save to db

import { createPosts } from "@/database/post/post.repository";
import { fetchAndParseURL } from "@/lib/parser";
import { TCategory } from "@/types/utils/category.type";

const CATEGORIES = [
  // "business",
  // "crime",
  // "domestic",
  "education",
  // "entertainment",
  // "environment",
  // "food",
  // "health",
  // "lifestyle",
  // "other",
  // "politics",
  // "science",
  // "sports",
  // "technology",
  // "top",
  // "tourism",
  // "world",
];
const LANGUAGE = "en";

const SCOPED_CATEGORIES = [
  "business",
  "entertainment",
  "health",
  "politics",
  "top",
];
const SUPPORTED_COUNTRIES = ["ng"];

export const fetchWithRetries = async (
  input: RequestInfo | URL,
  retries: number = 3,
): Promise<any> => {
  try {
    const response = await fetch(input);

    if (response.status === 429) {
      throw new Error("too many requests");
    }

    const data = await response.json();

    if (response.ok) {
      return data;
    }

    // if (
    //   data?.cause?.code &&
    //   data?.cause?.code === "UND_ERR_CONNECT_TIMEOUT" &&
    //   retries > 0
    // ) {
    //   console.log("Retrying...");
    //   return await fetchWithRetries(input, retries - 1);
    // }

    throw data;
  } catch (error) {
    if (error instanceof TypeError) {
      if (
        // @ts-expect-error TODO
        error?.cause?.code &&
        // @ts-expect-error TODO
        error?.cause?.code === "UND_ERR_CONNECT_TIMEOUT" &&
        retries > 0
      ) {
        console.log("Retrying...");
        return await fetchWithRetries(input, retries - 1);
      }
    }
    throw error;
  }
};

export const fetchNewsDataArticles = async () => {
  for (const category of CATEGORIES) {
    try {
      const response = await fetchWithRetries(
        `https://newsdata.io/api/1/latest?apikey=${process.env.NEWSDATA_API_KEY}&category=${category}&language=${LANGUAGE}&prioritydomain=medium`,
      );

      const data = response.results;

      const articles = [];

      for (const article of data) {
        console.log(article.title, category);
        const parsedArticle = await fetchAndParseURL(article.link);

        if (!parsedArticle.content) {
          continue;
        }

        const post = {
          title: article.title,
          author_id: article.source_id,
          link: article.link,
          content: parsedArticle.content,
          description: article.description,
          published_at: article.pubDate,
          image_url: article.image_url,
          video_url: article.video_url,
          source: {
            id: article.source_id,
            name: article.source_name,
            icon: article.source_icon,
            priority: article.source_priority,
            url: article.source_url,
          },
          keywords: article.keywords,
          language: article.language,
          country: article.country,
          category: [category] as TCategory[],
          published: true,
          external: true,
        };

        articles.push(post);
      }

      await createPosts(articles);

      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      if (error instanceof TypeError) {
        // @ts-expect-error TODO
        console.log("cause: ", error.cause.code);
        console.log("message: ", error.message);
      }

      if (error instanceof Error) {
        if (error.message === "too many requests") {
          //   await new Promise((resolve) => setTimeout(resolve, 60000));
          break;
        }
      }
      console.log(error);
    }
  }
};
