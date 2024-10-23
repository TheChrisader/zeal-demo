import lookup from "country-code-lookup";
import { createPosts } from "@/database/post/post.repository";
import { fetchAndParseURL } from "@/lib/parser";
import { IPost } from "@/types/post.type";
import { calculateReadingTime, cleanContent } from "@/utils/post.utils";
import { MongoBulkWriteError } from "mongodb";

type Thread = {
  uuid: string;
  url: string;
  site_full: string;
  site: string;
  site_section: string;
  site_categories: string[];
  section_title: string;
  title: string;
  title_full: string;
  published: string;
  replies_count: number;
  participants_count: number;
  site_type: string;
  country: string;
  main_image: string;
  performance_score: number;
  domain_rank: number;
  domain_rank_updated: string;
  reach: null;
};

type PostObject = {
  thread: Thread;
  uuid: string;
  url: string;
  ord_in_thread: number;
  parent_url: null;
  author: string;
  published: string;
  title: string;
  text: string;
  highlightText: string;
  highlightTitle: string;
  highlightThreadTitle: string;
  language: string;
  sentiment: string | null;
  categories: string[] | null;
  external_links: string[];
  external_images: string[];
  entities: {
    persons: { name: string; sentiment: string }[];
    organizations: { name: string; sentiment: string }[];
    locations: { name: string; sentiment: string }[];
  };
  rating: number | null;
  crawled: string;
  updated: string;
};

type ApiResponse = {
  posts: PostObject[];
  totalResults: number;
  moreResultsAvailable: number;
  next: string | null;
  requestsLeft: number;
  warnings: null;
};

export const fetchWithRetries = async (
  input: RequestInfo | URL,
  retries: number = 3,
): Promise<ApiResponse> => {
  try {
    const response = await fetch(input);

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

// language english default, need opt out

const categories: Record<string, { filter: string }>[] = [
  //   "For you", //accumulation
  // {
  //   Breaking: {
  //     filter:
  //       "(category:(war, conflict and unrest) OR category:(disaster and accident))",
  //   },
  // }, // global world news api
  // //   //   "Viral Videos", // no answer
  // //   // local
  // {
  //   Politics: {
  //     filter: "thread.country:ng category:politics",
  //   },
  // },
  // //   //   "Headlines", // worldnews, local
  // {
  //   Weather: {
  //     filter: "thread.country:ng category:weather",
  //   },
  // }, //
  // //   // global
  // { "Top US News": { filter: "thread.country:us" } },
  // { "UK Top News": { filter: "site_category:top_news_gb" } },
  // {
  //   "EU News": {
  //     filter:
  //       "(thread.country:DE OR thread.country:FR OR thread.country:IT OR thread.country:ES) language:english",
  //   },
  // },
  // {
  //   "Asian News": {
  //     filter:
  //       "(thread.country:CN OR thread.country:IN OR thread.country:JP OR thread.country:ID) language:english",
  //   },
  // },
  // //   // entertainment
  // { "Celebrity News": { filter: "site_category:celebrity_fan_gossip" } },
  // { "Top Movies": { filter: "site_category:movies" } },
  // { "Trending Music": { filter: "site_category:music language:english" } },
  // //   //   "Hot Interviews", // no answer
  // //   // business
  // { Economy: { filter: "category:(economy, business and finance)" } },
  // {
  //   "Personal Finance": {
  //     filter: "(site_category:financial_news OR site_category=investing)",
  //   },
  // },
  // { "Market Watch": { filter: "site_category:enterprise_news" } },
  // { "Startup News": { filter: "site_category:investing" } },
  // //   //   "Entrepreneurship",
  // { "E-Commerce": { filter: "site_category:shopping" } },
  // //   // tech
  // { "Latest Tech News": { filter: "category:(science and technology)" } },
  // {
  //   "Artificial Intelligence": {
  //     filter:
  //       "title:(AI OR Artificial Intelligence OR Machine Learning OR ChatGPT)",
  //   },
  // },
  // { Crypto: { filter: "title:(crypto OR bitcoin OR blockchain)" } },
  // {
  //   Fintech: {
  //     filter:
  //       "(category:(Economy, Business and Finance) AND category:(Science and Technology)) thread.country:ng",
  //   },
  // },
  // {
  //   Cartech: {
  //     filter:
  //       "(site_category:vehicles OR site_category:auto_repair) language:english",
  //   },
  // },
  { "Gadgets Buying Guide": { filter: "(site_category:computer_reviews)" } },
  // // health
  { "Health News": { filter: "category:health" } },
  {
    "Food & Nutrition": {
      filter: "(site_category:food AND category:(Lifestyle and Leisure))",
    },
  },
  { "Travel & Tourism": { filter: "(site_category:travel)" } },
  {
    "Style & Beauty": {
      filter: "(site_category:style_and_fashion)",
    },
  },
  {
    "Family & Parenting": {
      filter:
        "(site_category:family_and_parenting OR site_category:parenting_teens)",
    },
  },
  // // sports
  { "Top Sports News": { filter: "category:sport" } },
  {
    "UK Premiership": {
      filter: "category:sport site_category:football thread.country:gb",
    },
  },
  { Basketball: { filter: "site_category:pro_basketball" } },
  {
    Gaming: {
      filter: "(site_category:games OR site_category:video_and_computer_games)",
    },
  },
  // career
  {
    "Latest Job News": {
      filter:
        "(site_category:jobs OR site_category:job_fair OR site_category:job_search) thread.country:ng",
    },
  },
  {
    "Career Tips": {
      filter:
        "(site_category:career_advice OR site_category:career_planning) language:english",
    },
  },
  {
    "Top Global Jobs": {
      filter:
        "(site_category:jobs OR site_category:job_fair OR site_category:job_search)",
    },
  },
];

function extractDomain(url: string): string {
  // Create a URL object from the provided URL string
  const urlObj = new URL(url);

  // Extract the hostname and split it to get the domain part
  const domainParts = urlObj.hostname.split(".");

  // Return the second-to-last part (e.g., "google" from "www.google.com")
  const result =
    domainParts.length > 1
      ? domainParts[domainParts.length - 2]
      : domainParts[0];
  return result as string;
}

//   function extractTopLevelDomain(url: string): string {
//     // Create a URL object from the provided URL string
//     const urlObj = new URL(url);

//     // Extract the hostname
//     const hostname = urlObj.hostname;

//     // Split the hostname into parts
//     const domainParts = hostname.split(".");

//     // Return the last part (top-level domain)
//     return domainParts[domainParts.length - 1] as string;
//   }

const stripKeywords = (post: PostObject): string[] => {
  let keywords: string[] = [];

  if (post.thread.site_categories) {
    keywords = keywords.concat(post.thread.site_categories);
  }

  if (post.categories) {
    keywords = keywords.concat(post.categories);
  }

  if (post.entities.locations) {
    keywords = keywords.concat(
      post.entities.locations.map(
        (location: { name: string }) => location.name,
      ),
    );
  }
  if (post.entities.organizations) {
    keywords = keywords.concat(
      post.entities.organizations.map((org: { name: string }) => org.name),
    );
  }
  if (post.entities.persons) {
    keywords = keywords.concat(
      post.entities.persons.map((person: { name: string }) => person.name),
    );
  }

  return keywords;
};

const getCountryCode = (country: string): string[] => {
  try {
    return [lookup.byIso(country)!.country];
  } catch {
    console.log("Could not determine ISO code type");
    return [] as string[];
  }
};

const handlePosts = async (
  category: Record<
    string,
    {
      filter: string;
    }
  >,
  next?: string,
  count: number = 2,
) => {
  const fetchedPosts: Partial<IPost>[] = [];
  const [key] = Object.keys(category);
  const data = await fetchWithRetries(
    next
      ? `https://api.webz.io/${next}`
      : `https://api.webz.io/newsApiLite?token=${process.env.WEBZ_API_KEY}&q=${category[key!]?.filter}`,
  );

  for (const post of data.posts) {
    let parsedArticle;

    try {
      parsedArticle = await fetchAndParseURL(post.url);
    } catch {
      console.log("Content can not be parsed. Skipping article...");
      continue;
    }
    console.log(post.title || parsedArticle.title);

    if (!parsedArticle.content) {
      continue;
    }

    const postToSave: Partial<IPost> = {
      title: post.title || parsedArticle.title,
      author_id: post.author || parsedArticle.byline || extractDomain(post.url),
      link: post.url,
      headline: false,
      content: parsedArticle.content,
      description: parsedArticle.excerpt || post.text,
      published_at: post.published,
      image_url: post.thread.main_image,
      video_url: undefined,
      source: {
        id: extractDomain(post.url),
        name: parsedArticle.siteName || extractDomain(post.url),
        url: post.thread.site_full || post.thread.site,
        icon: `https://www.google.com/s2/favicons?domain=${post.thread.site}&sz=64`,
      },
      language: "English",
      country: getCountryCode(post.thread.country),
      //   category: [...new Set([key!, ...(post.categories || [])])],
      category: [key!],
      keywords: stripKeywords(post),
      published: true,
      ttr: calculateReadingTime(cleanContent(parsedArticle.content)),
      external: true,
    };

    fetchedPosts.push(postToSave);
  }

  let savedPosts;

  try {
    savedPosts = await createPosts(fetchedPosts);

    console.log(`${savedPosts.length} posts under ${key} category saved`);
  } catch (err) {
    if (err instanceof MongoBulkWriteError) {
      console.log(
        `${err.result.insertedCount} posts under ${key} category saved`,
      );
      // @ts-ignore
    } else if (err instanceof Error && err.code === 11000) {
      console.log(err.message, "!!!!!!!!!!!!!!11");
      console.log(
        // @ts-ignore
        `${err.result.insertedCount} posts under ${key} category saved`,
      );
    } else {
      console.log(err);
      console.log(`Failed to save posts under ${key} category`);
    }
  }

  if (!next && data.next) {
    await handlePosts(category, data.next, count - 1);
  }
};

export const fetchWebz = async (next?: string, count = 2) => {
  if (count <= 0) {
    return;
  }

  for (const category of categories) {
    try {
      await handlePosts(category);
      //   const fetchedPosts: Partial<IPost>[] = [];
      //   const [key] = Object.keys(category);
      //   const data = await fetchWithRetries(
      //     next
      //       ? next
      //       : `https://api.webz.io/newsApiLite?token=${process.env.WEBZ_API_KEY}&q=${category[key!]?.filter} language:english`,
      //   );

      //   for (const post of data.posts) {
      //     let parsedArticle;

      //     try {
      //       parsedArticle = await fetchAndParseURL(post.url);
      //     } catch {
      //       continue;
      //     }

      //     if (!parsedArticle.content) {
      //       continue;
      //     }

      //     const postToSave: Partial<IPost> = {
      //       title: post.title,
      //       author_id: post.author || extractDomain(post.url),
      //       link: post.url,
      //       headline: false,
      //       content: parsedArticle.content,
      //       description: post.text,
      //       published_at: post.published,
      //       image_url: post.thread.main_image,
      //       video_url: undefined,
      //       source: {
      //         id: extractDomain(post.url),
      //         name: extractDomain(post.url),
      //         url: post.thread.site_full || post.thread.site,
      //         icon: `https://www.google.com/s2/favicons?domain=${post.thread.site}&sz=64`,
      //       },
      //       language: "English",
      //       country: [lookup.byIso(post.thread.country)!.country],
      //       //   category: [...new Set([key!, ...(post.categories || [])])],
      //       category: [key!],
      //       keywords: stripKeywords(post),
      //       published: true,
      //       ttr: calculateReadingTime(cleanContent(parsedArticle.content)),
      //       external: true,
      //     };

      //     fetchedPosts.push(postToSave);
      //   }

      //   await createPosts(fetchedPosts);

      //   if (!next && data.next) {
      //     await fetchWebz(data.next, count - 1);
      //   }
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
  }
};
