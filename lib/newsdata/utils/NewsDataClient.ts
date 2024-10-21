import { TCategory } from "@/types/utils/category.type";
import { Language } from "@/types/utils/language.type";
import { ARCHIVE_NEWS_URL, LATEST_NEWS_URL } from "./constants";

interface NewsDataOptions {
  id: string;
  from_date: string;
  to_date: string;
  q: string;
  qInTitle: string;
  qInMeta: string;
  timeframe: string;
  country: string; //TODO
  category: TCategory;
  excludecategory: TCategory;
  language: Language;
  tag: string;
  sentiment: "positive" | "negative" | "neutral";
  region: string;
  domain: string;
  domainurl: string;
  excludedomain: string;
  excludefield: string; //TODO
  prioritydomain: "top" | "medium" | "low";
  timezone: string;
  full_content: 0 | 1;
  image: 0 | 1;
  video: 0 | 1;
  removeduplicate: 0 | 1;
  size: number;
  page: string;
}

const NewsDataResponseCodes = [200, 400, 401, 403, 409, 415, 422, 429, 500];

const NewsDataErrorMessages: Record<number, string> = {
  400: "Parameter missing",
  401: "Unauthorized",
  403: "CORS policy failed. IP/Domain restricted",
  409: "Parameter duplicate",
  415: "Unsupported type",
  422: "Unprocessable entity",
  429: "Too many requests",
  500: "Internal server error",
};

const NewsDataErrorCodes: Record<number, string> = {
  400: "parameter-missing",
  401: "unauthorized",
  403: "cors-policy-failed. ip/domain-restricted",
  409: "parameter-duplicate",
  415: "unsupported-type",
  422: "unprocessable-entity",
  429: "too-many-requests",
  500: "internal-server-error",
};

export class NewsDataHTTPError extends Error {
  status: number;
  code: string;
  constructor(status: number) {
    super();
    this.status = status;
    if (NewsDataResponseCodes.includes(status)) {
      this.message = NewsDataErrorMessages[status] as string;
      this.code = NewsDataErrorCodes[status] as string;
    } else {
      this.message = "Internal Server Error";
      this.code = "internal-server-error";
    }
  }
}

export class NewsDataProcessingError extends Error {
  code: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code ? code : "internal-error";
  }
}

// TODO: Add proper types, ensure the passed params fit the api specs (skip over
// ones that dont), stick to the specific rules and classes

export class NewsDataAPiClient {
  latestNewsUrl: string;
  archivedNewsUrl: string;
  exclude_fields: string;
  constructor(api_key: string) {
    this.archivedNewsUrl = ARCHIVE_NEWS_URL + api_key;
    this.latestNewsUrl = LATEST_NEWS_URL + api_key;
    this.exclude_fields =
      "&excludefield=content,ai_tag,sentiment,sentiment_stats,ai_region,ai_org";
  }

  constructURL(options: Partial<NewsDataOptions>) {
    let urlEndpoints = "";
    for (const [key, value] of Object.entries(options)) {
      urlEndpoints += `&${key}=${value}`;
    }
    return urlEndpoints;
  }

  parseURL(dirty_url: string) {
    try {
      const url = new URL(dirty_url);
      const queryOptions = url.searchParams.entries();

      const options = {} as Partial<NewsDataOptions>;

      let queryOption = queryOptions.next();

      while (queryOption.value) {
        const key: keyof NewsDataOptions = queryOption.value[0];
        let value: NewsDataOptions[keyof NewsDataOptions] =
          queryOption.value[1];

        if (key === "size") {
          value = Number(value);
        }

        if (key in options) {
          throw new NewsDataProcessingError(
            `Duplicate parameters in request.`,
            `duplicate-parameters-in-request`,
          );
        }

        (options[key] as NewsDataOptions[keyof NewsDataOptions]) = value;
        queryOption = queryOptions.next();
      }

      return options;
    } catch (error) {
      throw error;
    }
  }

  async fetchSingularArticle(article_id: string) {
    try {
      const article_url = this.latestNewsUrl + `&id=${article_id}`;
      const response = await fetch(article_url);

      if (!response.ok) {
        throw new NewsDataHTTPError(response.status);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async fetchLatestNews(options: Partial<NewsDataOptions>) {
    try {
      const response = await fetch(
        this.latestNewsUrl + this.constructURL(options) + this.exclude_fields,
      );

      if (!response.ok) {
        throw new NewsDataHTTPError(response.status);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async fetchArchivedNews(options: Partial<NewsDataOptions>) {
    try {
      const response = await fetch(
        this.archivedNewsUrl + this.constructURL(options) + this.exclude_fields,
      );

      if (!response.ok) {
        throw new NewsDataHTTPError(response.status);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}
