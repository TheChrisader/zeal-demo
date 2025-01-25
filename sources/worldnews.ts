import lookup from "country-code-lookup";
import { createPosts } from "@/database/post/post.repository";
import { fetchAndParseURL } from "@/lib/parser";
import { IPost } from "@/types/post.type";
import { calculateReadingTime, cleanContent } from "@/utils/post.utils";
import { SlugGenerator } from "@/lib/slug";

type WorldNewsApiResponse = {
  top_news: {
    news: {
      id: number;
      title: string;
      text: string;
      summary: string;
      url: string;
      image: string;
      video: string | null;
      publish_date: string;
      author: string;
      authors: string[];
    }[];
  }[];
  language: string;
  country: string;
};
// const res = {
//   top_news: [
//     {
//       news: [
//         {
//           id: 224767206,
//           title: "Jury to Begin Deliberations In Trump Trial",
//           text: "...",
//           summary: "...",
//           url: "https://politicalwire.com/2024/05/28/jury-to-begin-deliberations-in-trump-trial/",
//           image:
//             "https://politicalwire.com/wp-content/uploads/2018/02/PW-podcast-logo.jpg",
//           video: null,
//           publish_date: "2024-05-29 00:10:48",
//           author: "Taegan Goddard",
//           authors: ["Taegan Goddard"],
//         },
//       ],
//     },
//   ],
//   language: "en",
//   country: "us",
// };

function extractDomain(url: string): string {
  const urlObj = new URL(url);

  const domainParts = urlObj.hostname.split(".");

  // Return the second-to-last part (e.g., "google" from "www.google.com")
  const result =
    domainParts.length > 1
      ? domainParts[domainParts.length - 2]
      : domainParts[0];
  return result as string;
}

function extractHostname(url: string): string {
  const urlObj = new URL(url);

  const hostname = urlObj.hostname;

  return hostname;
}

export const fetchWithRetries = async (
  input: RequestInfo | URL,
  retries: number = 3,
): Promise<WorldNewsApiResponse> => {
  try {
    const response = await fetch(input, {
      headers: {
        "x-api-key": process.env.WORLDNEWS_API_KEY as string,
      },
    });

    if (response.status === 429) {
      throw new Error("too many requests");
    }

    const data = await response.json();

    if (response.ok) {
      return data;
    }

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

const hash = (s: string): string => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

const getCurrentDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const g = [
  {
    Headlines: {
      filter:
        "(site:arise.tv OR site:vanguardngr.com OR  site:dailytrust.com) language:english",
    },
  },
  {
    Headlines: {
      filter:
        "(site:onlinenigeria.com OR site:channelstv.com OR  site:premiumtimesng.com) language:english",
    },
  },
  {
    Headlines: {
      filter:
        "(site:graphic.com.gh OR site:ghanaiantimes.com.gh OR  site:pulsesports.ng) language:english",
    },
  },
  {
    Headlines: {
      filter:
        "(site:standardmedia.co.ke OR site:tuko.co.ke OR  site:businesstoday.co.ke) language:english",
    },
  },
];

const COUNTRIES = [
  "ng",
  "gh",
  // "ke",
  // "za",
  // "ug",
  // "zm",
  // "na",
  // "et",
  // "sl",
  "gb",
  "us",
  "jp",
  "cn",
  "in",
];

const getRelevantCategories = (countryCode: string) => {
  if (countryCode === "us") {
    return ["Top US News"];
  } else if (countryCode === "gb") {
    return ["UK Top News"];
  } else if (
    countryCode === "jp" ||
    countryCode === "cn" ||
    countryCode === "in"
  ) {
    return ["Asian News"];
  } else {
    return [];
  }
};

const ensureDelay = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

const slugGenerator = new SlugGenerator();

export const fetchWorldNewsHeadlines = async () => {
  try {
    for (const countryCode of COUNTRIES) {
      const fetchedPosts: Partial<IPost>[] = [];
      let data;

      try {
        data = await fetchWithRetries(
          `https://api.worldnewsapi.com/top-news?source-country=${countryCode}&language=en&date=${getCurrentDateString()}`,
        );
      } catch {
        continue;
      }
      const topNews = data.top_news;
      for (const section of topNews) {
        const articles = section.news;
        const sectionHash = hash(
          articles.reduce(
            (acc: string, curr: { url: string }) => acc + curr.url,
            "",
          ),
        );
        for (const article of articles) {
          console.log(article.url);
          let parsedArticle;

          try {
            parsedArticle = await fetchAndParseURL(article.url);
          } catch {
            continue;
          }

          if (!parsedArticle.content) {
            continue;
          }

          const post: Partial<IPost> = {
            title: article.title,
            slug: slugGenerator.generate(article.title),
            author_id: parsedArticle.byline || extractDomain(article.url),
            link: article.url,
            headline: true,
            cluster_id: sectionHash,
            content: parsedArticle.content,
            description: parsedArticle.excerpt,
            published_at: article.publish_date || new Date().toISOString(),
            image_url: article.image,
            video_url: article.video,
            source: {
              id: extractDomain(article.url),
              name: parsedArticle.siteName || extractDomain(article.url),
              url: `https://${extractHostname(article.url)}`,
              icon: `https://www.google.com/s2/favicons?domain=${extractHostname(article.url)}&sz=64`,
            },
            language: "English",
            country: [lookup.byIso(data.country)!.country],
            ttr: calculateReadingTime(cleanContent(parsedArticle.content)),
            category: ["Headlines", ...getRelevantCategories(countryCode)],
            published: true,
            external: true,
          };

          fetchedPosts.push(post);
        }
      }

      try {
        await createPosts(fetchedPosts);
      } catch (err) {
        // @ts-expect-error TODO
        if (err instanceof Error && err.code === 11000) {
          console.log(err.message, "!!!!!!!!!!!!!!11");
          console.log(
            // @ts-expect-error TODO
            `Only ${err.result.insertedCount} posts under Headlines saved`,
          );
        } else {
          console.log(err.message);
        }
      }

      await ensureDelay();
    }
  } catch (error) {
    if (error instanceof TypeError) {
      // @ts-expect-error TODO
      console.log("cause: ", error.cause.code);
      console.log("message: ", error.message);
    }

    if (error instanceof Error) {
      if (error.message === "too many requests") {
        //   await new Promise((resolve) => setTimeout(resolve, 60000));
        console.log(error);
      }
    }
    console.log(error);
  }
};
