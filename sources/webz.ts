import lookup from "country-code-lookup";
import { createArticles } from "@/database/article/article.repository";
import { fetchAndParseURL } from "@/lib/parser";
import { IArticle } from "@/types/article.type";
import { calculateReadingTime, cleanContent } from "@/utils/post.utils";
import { MongoBulkWriteError } from "mongodb";
import { SlugGenerator } from "@/lib/slug";
import { isTextEnglish, stripExtraWhitespace } from "@/utils/string.utils";

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

type ArticleObject = {
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
  articles: ArticleObject[];
  totalResults: number;
  moreResultsAvailable: number;
  next: string | null;
  requestsLeft: number;
  warnings: null;
};

const ensureDelay = async (num: number) => {
  await new Promise((resolve) => setTimeout(resolve, num * 1000));
};

export const saveArticlesWithRetries = async (
  articles: Partial<IArticle>[],
  key: string,
  retries: number = 3,
) => {
  let savedArticles;

  try {
    savedArticles = await createArticles(articles);
    console.log(`${savedArticles.length} articles under ${key} category saved`);
  } catch (err) {
    // @ts-expect-error TODO
    if (err instanceof Error && err.code === 11000) {
      console.log(err.message, "!!!!!!!!!!!!!!");
      console.log(
        // @ts-expect-error TODO
        `${err.result.insertedCount} articles under ${key} category saved`,
      );
      return;
    } else {
      if (retries > 0) {
        console.log("Retrying save...");
        await ensureDelay(3);
        await saveArticlesWithRetries(articles, key, retries - 1);
        return;
      }
    }
    // @ts-expect-error TODO
    console.log(err.message);
    console.log(`Failed to save articles under ${key} category`);
  }
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

const categories: Record<string, { filter: string; altCategory?: string[] }>[] =
  [
    // Nigeria
    {
      Headlines: {
        filter:
          "(site:arise.tv OR site:vanguardngr.com OR  site:dailytrust.com) language:english",
        altCategory: ["Top West African News"],
      },
    },
    {
      Headlines: {
        filter:
          "(site:onlinenigeria.com OR site:channelstv.com OR  site:premiumtimesng.com) language:english",
        altCategory: ["Top West African News"],
      },
    },
    {
      Headlines: {
        filter:
          "(site:qed.ng OR site:dailynigerian.com OR site:legit.ng) language:english",
        altCategory: ["Top West African News"],
      },
    },
    {
      Headlines: {
        filter:
          "(site:saharareporters.com OR site:thenationonlineng.net OR site:thecable.ng) language:english",
        altCategory: ["Top West African News"],
      },
    },
    {
      Headlines: {
        filter:
          "(site:thisdaylive.com OR site:pmnewsnigeria.com OR site:dailypost.ng) language:english",
        altCategory: ["Top West African News"],
      },
    },
    {
      Headlines: {
        filter: "(site:guardian.ng) language:english",
        altCategory: ["Top West African News"],
      },
    },
    // Ghana
    {
      Headlines: {
        filter:
          "(site:graphic.com.gh OR site:ghanaiantimes.com.gh OR site:theheraldghana.com) language:english",
        altCategory: ["Top West African News"],
      },
    },
    {
      Headlines: {
        filter:
          "(site:pulse.com.gh OR site:myjoyonline.com OR site:citinewsroom.com) language:english",
        altCategory: ["Top West African News"],
      },
    },
    {
      Headlines: {
        filter:
          "(site:ghanaweb.com OR site:accramail.com OR site:theheraldghana.com) language:english",
        altCategory: ["Top West African News"],
      },
    },
    // Uganda
    {
      Headlines: {
        filter:
          "(site:newvision.co.ug OR site:sunrise.ug OR site:pulse.ug) language:english",
        altCategory: ["Top East African News"],
      },
    },
    // Zambia
    {
      Headlines: {
        filter:
          "(site:times.co.zm OR site:lusakatimes.com OR site:zambianobserver.com) language:english",
        altCategory: ["Top Southern Africa News"],
      },
    },
    // Tanzania
    {
      Headlines: {
        filter: "tanzania language:english country:TZ category:Politics",
        altCategory: ["Top East African News"],
      },
    },
    {
      Breaking: {
        filter:
          "(category:(war, conflict and unrest) OR category:(disaster and accident)) language:english",
      },
    },
    {
      Politics: {
        filter: "category:Politics country:NG language:english",
      },
    },
    {
      Politics: {
        filter: "category:Politics country:GH language:english",
      },
    },
    {
      Politics: {
        filter: "category:Politics country:KE language:english",
      },
    },
    {
      Weather: {
        filter: "category:weather",
      },
    },
    // {
    //   "Top North African News": {
    //     filter: ""
    //   }
    // },
    {
      "Top West African News": {
        filter: "west africa language:english site_category:africa -country:US",
      },
    },
    {
      "Top East African News": {
        filter:
          "(site:standardmedia.co.ke OR site:tuko.co.ke OR  site:businesstoday.co.ke) language:english",
        altCategory: ["Headlines"],
      },
    },
    {
      "Top Southern Africa News": {
        filter:
          "south africa language:english site_category:africa -country:US",
        altCategory: ["Headlines"],
      },
    },
    {
      "Top US News": {
        filter:
          "(site:newsday.com OR site:latimes.com OR site:nytimes.com) language:english",
      },
    },
    { "UK Top News": { filter: "country:GB" } },
    {
      "EU News": {
        filter:
          "(thread.country:DE OR thread.country:FR OR thread.country:IT OR thread.country:ES) language:english",
      },
    },
    {
      "Asian News": {
        filter:
          "(thread.country:CN OR thread.country:IN OR thread.country:JP OR thread.country:ID) language:english",
      },
    },
    {
      "Celebrity News": {
        filter:
          "celebrity language:english category:(Arts, Culture and Entertainment)",
      },
    },
    {
      "Top Movies": {
        filter:
          "movies site_category:movies language:english category:(Arts, Culture and Entertainment)",
      },
    },
    {
      "Trending Music": {
        filter:
          "music language:english category:(Arts, Culture and Entertainment)",
      },
    },
    {
      "Hot Interviews": {
        filter:
          "interviews language:english category:(Arts, Culture and Entertainment) ",
      },
    },
    {
      Economy: {
        filter: "category:(economy, business and finance) language:english",
      },
    },
    {
      "Personal Finance": {
        filter:
          "personal finance (site_category:financial_news OR site_category=investing) language:english",
      },
    },
    {
      "Market Watch": {
        filter:
          "market watch category:(economy, business and finance) language:english",
      },
    },
    {
      "Startup News": {
        filter: "startups site_category:investing language:english",
      },
    },
    {
      Entrepreneurship: {
        filter:
          "entrepreneurship category:(economy, business and finance) domain_rank:<1000 language:english",
      },
    },
    {
      "E-Commerce": {
        filter:
          "e-commerce language:english category:(economy, business and finance)",
      },
    },
    { "Latest Tech News": { filter: "category:(science and technology)" } },
    {
      "Artificial Intelligence": {
        filter: "ai language:english  category:(science and technology)",
      },
    },
    {
      Crypto: {
        filter: "crypto  category:(science and technology) language:english",
      },
    },
    {
      Fintech: {
        filter: "african fintech language:english",
      },
    },
    {
      Cartech: {
        filter:
          "(site_category:vehicles OR site_category:auto_repair) language:english",
      },
    },
    {
      "Gadgets Buying Guide": {
        filter: "gadget review category:(science and technology)",
      },
    },
    { "Health News": { filter: "self care category:Health" } },
    {
      "Food & Nutrition": {
        filter:
          "food (site_category:food AND category:(Lifestyle and Leisure))",
      },
    },
    {
      "Travel & Tourism": {
        filter: "Travel (site_category:travel) language:english",
      },
    },
    {
      "Style & Beauty": {
        filter:
          "fashion category:(lifestyle and leisure) (site_category:style_and_fashion)",
      },
    },
    {
      "Family & Parenting": {
        filter:
          "(site_category:family_and_parenting OR site_category:parenting_teens)",
      },
    },
    { "Top Sports News": { filter: "category:sport" } },
    {
      "UK Premiership": {
        filter:
          "category:sport site_category:football thread.country:gb language:english",
      },
    },
    {
      Basketball: {
        filter: "basketball site_category:pro_basketball language:english",
      },
    },
    {
      Gaming: {
        filter:
          "video games (site_category:games OR site_category:video_and_computer_games) language:english",
      },
    },
    {
      "Latest Job News": {
        filter:
          "africa (site_category:jobs OR site_category:job_fair OR site_category:job_search)",
      },
    },
    {
      "Career Tips": {
        filter:
          "career (site_category:career_advice OR site_category:career_planning) language:english",
      },
    },
    {
      "Top Global Jobs": {
        filter:
          "global jobs (site_category:jobs OR site_category:job_search) language:english",
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

const stripKeywords = (article: ArticleObject): string[] => {
  let keywords: string[] = [];

  if (article.thread.site_categories) {
    keywords = keywords.concat(article.thread.site_categories);
  }

  if (article.categories) {
    keywords = keywords.concat(article.categories);
  }

  if (article.entities.locations) {
    keywords = keywords.concat(
      article.entities.locations.map(
        (location: { name: string }) => location.name,
      ),
    );
  }
  if (article.entities.organizations) {
    keywords = keywords.concat(
      article.entities.organizations.map((org: { name: string }) => org.name),
    );
  }
  if (article.entities.persons) {
    keywords = keywords.concat(
      article.entities.persons.map((person: { name: string }) => person.name),
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

const slugGenerator = new SlugGenerator();

const handleArticles = async (
  category: Record<
    string,
    {
      filter: string;
      altCategory?: string[];
    }
  >,
  time: number,
  next?: string,
  count: number = 2,
) => {
  const fetchedArticles: Partial<IArticle>[] = [];
  const [key] = Object.keys(category);
  // if (key === "Top US News") {
  // } else {
  //   return;
  // }
  const [value] = Object.values(category);
  const data = await fetchWithRetries(
    next
      ? `https://api.webz.io/${next}`
      : `https://api.webz.io/filterWebContent?token=${process.env.WEBZ_API_KEY}&format=json&ts=${time}&sort=relevancy&q=${category[key!]?.filter}`,
  );

  for (const article of data.articles) {
    let parsedArticle;

    try {
      parsedArticle = await fetchAndParseURL(article.url);
    } catch {
      console.log("Content can not be parsed. Skipping article...");
      continue;
    }

    if (!parsedArticle.title || !article.title) {
      console.log(1);
      continue;
    }

    if (!isTextEnglish(article.title || parsedArticle.title)) {
      console.log(2);
      continue;
    }

    if (!parsedArticle.content || parsedArticle.textContent.length < 200) {
      console.log(3);
      continue;
    }

    console.log(article.title || parsedArticle.title);

    const extraCategories = [];
    if (value?.altCategory && value.altCategory.length > 0) {
      extraCategories.push(...value.altCategory);
    }

    const articleToSave: Partial<IArticle> = {
      title: article.title || parsedArticle.title,
      slug: slugGenerator.generate(article.title || parsedArticle.title),
      author_id: article.author || parsedArticle.byline || extractDomain(article.url),
      link: article.url,
      headline: false,
      content: stripExtraWhitespace(parsedArticle.content),
      description: parsedArticle.excerpt || article.text,
      published_at: article.published,
      image_url: article.thread.main_image,
      video_url: undefined,
      generatedBy: "auto",
      source: {
        id: extractDomain(article.url),
        name: parsedArticle.siteName || extractDomain(article.url),
        url: article.thread.site_full || article.thread.site,
        icon: `https://www.google.com/s2/favicons?domain=${article.thread.site}&sz=64`,
      },
      language: "English",
      country: getCountryCode(article.thread.country),
      //   category: [...new Set([key!, ...(article.categories || [])])],
      category: [key!, ...extraCategories],
      keywords: stripKeywords(article),
      published: true,
      ttr: calculateReadingTime(cleanContent(parsedArticle.content)),
      external: true,
    };

    fetchedArticles.push(articleToSave);
  }

  await saveArticlesWithRetries(fetchedArticles, key as string);

  // let savedArticles;

  // try {
  //   savedArticles = await createArticles(fetchedArticles);

  //   console.log(`${savedArticles.length} articles under ${key} category saved`);
  // } catch (err) {
  //   if (err instanceof MongoBulkWriteError) {
  //     console.log(
  //       `${err.result.insertedCount} articles under ${key} category saved`,
  //     );
  //     // @ts-expect-error TODO
  //   } else if (err instanceof Error && err.code === 11000) {
  //     console.log(err.message, "!!!!!!!!!!!!!!11");
  //     console.log(
  //       // @ts-expect-error TODO
  //       `${err.result.insertedCount} articles under ${key} category saved`,
  //     );
  //   } else {
  //     console.log(err.message);
  //     console.log(`Failed to save articles under ${key} category`);
  //   }
  // }

  // if (!next && data.next) {
  //   await handleArticles(category, data.next, count - 1);
  // }
};

export const fetchWebz = async (next?: string, count = 2) => {
  console.log("Begin...");
  if (count <= 0) {
    return;
  }

  const time = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  // const time = new Date().getTime();

  for (const category of categories) {
    try {
      await handleArticles(category, time);
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

  console.log("...End.");
};