import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { NextResponse } from "next/server";
import { CATEGORIES } from "@/categories/flattened";
import PostModel from "@/database/post/post.model";

interface AnalyticsResponse {
  posts_views: FormattedAnalyticsData[];
  category_distribution: CategoryDistribution[];
  source_distribution: SourceDistribution[];
}

interface FormattedAnalyticsData {
  id: string;
  path: string;
  title: string;
  category: string[];
  views: string;
}

interface CategoryDistribution {
  category: string;
  count: number;
}

interface SourceDistribution {
  source: string;
  count: number;
}

interface PostLookupData {
  _id: string;
  title: string;
  category: string[];
  slug: string;
}

interface GoogleAnalyticsRow {
  dimensionValues: Array<{
    value: string;
  }>;
  metricValues: Array<{
    value: string;
  }>;
}

interface GoogleAnalyticsResponse {
  rows: GoogleAnalyticsRow[];
}

// Constants
const GA_POST_PATH_PATTERN = "/post/";
const GA_EN_PATH_PREFIX = "/en/post/";
const TOP_RESULTS_LIMIT = 15;
const SOURCE_TYPES = ["user", "auto"];

// Helper Functions

/**
 * Gets today's date range (start and end of day)
 * @returns Object with start and end Date objects for today
 */
function getTodayDateRange() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  todayStart.setHours(todayStart.getHours() - 1);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  todayEnd.setHours(todayEnd.getHours() - 1);
  return { todayStart, todayEnd };
}

/**
 * Extracts slug from Google Analytics page path
 * @param path - The page path from GA (e.g., "/en/post/slug")
 * @returns The extracted slug without the prefix
 */
function extractSlugFromPath(path?: string): string {
  if (!path) return "";
  return path.replace(GA_EN_PATH_PREFIX, "");
}

/**
 * Creates the Google Analytics query configuration
 * @param propertyId - The GA4 property ID
 * @returns The GA report request configuration
 */
function createAnalyticsQuery(propertyId: string) {
  return {
    property: `properties/${propertyId}`,
    dateRanges: [
      {
        startDate: "yesterday",
        endDate: "today",
      },
    ],
    dimensions: [
      {
        name: "pagePath",
      },
      {
        name: "pageTitle",
      },
    ],
    metrics: [
      {
        name: "screenPageViews",
      },
    ],
    orderBys: [
      {
        metric: {
          metricName: "screenPageViews",
        },
        desc: true,
      },
    ],
    limit: TOP_RESULTS_LIMIT,
    dimensionFilter: {
      andGroup: {
        expressions: [
          {
            filter: {
              fieldName: "pagePath",
              stringFilter: {
                matchType: "CONTAINS" as const,
                value: GA_POST_PATH_PATTERN,
                caseSensitive: false,
              },
            },
          },
          {
            filter: {
              fieldName: "pagePath",
              stringFilter: {
                matchType: "CONTAINS" as const,
                value: "-",
                caseSensitive: false,
              },
            },
          },
        ],
      },
    },
  };
}

/**
 * Fetches Google Analytics data for the specified property
 * @param propertyId - The GA4 property ID
 * @returns Promise resolving to the GA response data
 */
async function fetchGoogleAnalyticsData(propertyId: string) {
  const analyticsDataClient = new BetaAnalyticsDataClient();
  const query = createAnalyticsQuery(propertyId);

  console.log("Running report for property:", propertyId);

  const [response] = await analyticsDataClient.runReport(query);
  return response as GoogleAnalyticsResponse;
}

/**
 * Fetches category distribution from MongoDB
 * @param todayStart - Start of today (Date object)
 * @param todayEnd - End of today (Date object)
 * @returns Promise resolving to category distribution data
 */
async function fetchCategoryDistribution(todayStart: Date, todayEnd: Date) {
  return PostModel.aggregate([
    {
      $match: {
        category: { $in: CATEGORIES },
        published_at: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      },
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);
}

/**
 * Fetches source distribution from MongoDB
 * @param todayStart - Start of today (Date object)
 * @param todayEnd - End of today (Date object)
 * @returns Promise resolving to source distribution data
 */
async function fetchSourceDistribution(todayStart: Date, todayEnd: Date) {
  return PostModel.aggregate([
    {
      $match: {
        source_type: { $in: SOURCE_TYPES },
        published_at: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      },
    },
    {
      $group: {
        _id: "$source_type",
        count: { $sum: 1 },
      },
    },
  ]);
}

/**
 * Fetches posts data based on slugs for efficient lookup
 * @param slugs - Array of post slugs to lookup
 * @returns Promise resolving to posts array
 */
async function fetchPostsLookup(slugs: string[]): Promise<PostLookupData[]> {
  return PostModel.find<PostLookupData>({ slug: { $in: slugs } })
    .select("_id title category slug")
    .exec();
}

/**
 * Creates an optimized Map-based lookup for posts
 * @param posts - Array of post objects
 * @returns Map with slug as key and post object as value
 */
function createPostsLookup(
  posts: PostLookupData[],
): Map<string, PostLookupData> {
  const lookup = new Map<string, PostLookupData>();
  posts.forEach((post) => {
    lookup.set(post.slug.trim(), post);
  });
  return lookup;
}

/**
 * Transforms MongoDB category distribution to the expected format
 * @param categoryDistribution - Raw MongoDB aggregation result
 * @returns Formatted category distribution array
 */
function formatCategoryDistribution(
  categoryDistribution: { _id: string[]; count: number }[],
): CategoryDistribution[] {
  return categoryDistribution.map((cat) => ({
    category: cat._id[0] as string,
    count: cat.count,
  }));
}

/**
 * Transforms MongoDB source distribution to the expected format
 * @param sourceDistribution - Raw MongoDB aggregation result
 * @returns Formatted source distribution array
 */
function formatSourceDistribution(
  sourceDistribution: { _id: string; count: number }[],
): SourceDistribution[] {
  return sourceDistribution.map((cat) => ({
    source: cat._id,
    count: cat.count,
  }));
}

/**
 * Transforms Google Analytics data using the posts lookup
 * @param gaResponse - Google Analytics response data
 * @param postsLookup - Map of posts for efficient lookup
 * @returns Transformed analytics data array
 */
function transformAnalyticsData(
  gaResponse: GoogleAnalyticsResponse,
  postsLookup: Map<string, PostLookupData>,
): FormattedAnalyticsData[] {
  if (!gaResponse?.rows) return [];

  return gaResponse.rows
    .map((row) => {
      const slug = extractSlugFromPath(row?.dimensionValues?.[0]?.value);
      const post = postsLookup.get(slug);

      if (!post) return null;

      return {
        id: post._id,
        path: row.dimensionValues[0]?.value,
        title: row.dimensionValues[1]?.value,
        category: post.category,
        views: row.metricValues[0]?.value,
      };
    })
    .filter(Boolean) as FormattedAnalyticsData[];
}

/**
 * Analytics API endpoint that fetches and combines data from Google Analytics and MongoDB
 * @param request - Next.js request object
 * @returns Promise resolving to analytics response with formatted data
 */
export async function GET(): Promise<
  NextResponse<AnalyticsResponse | { error: string }>
> {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID;

    if (!propertyId) {
      throw new Error("GA4_PROPERTY_ID is not set in environment variables.");
    }

    const { todayStart, todayEnd } = getTodayDateRange();

    // Fetch all data in parallel for optimal performance
    const [gaResponse, categoryDistribution, sourceDistribution] =
      await Promise.all([
        fetchGoogleAnalyticsData(propertyId),
        fetchCategoryDistribution(todayStart, todayEnd),
        fetchSourceDistribution(todayStart, todayEnd),
      ]);

    // Extract slugs from GA data for post lookup
    const slugs =
      gaResponse?.rows
        ?.map((row) => extractSlugFromPath(row.dimensionValues[0]?.value))
        .filter(Boolean) || [];

    // Fetch posts and create optimized lookup
    const posts = await fetchPostsLookup(slugs);
    const postsLookup = createPostsLookup(posts);

    // Transform and format all data
    const posts_views = transformAnalyticsData(gaResponse, postsLookup);
    const category_distribution =
      formatCategoryDistribution(categoryDistribution);
    const source_distribution = formatSourceDistribution(sourceDistribution);

    const responseData: AnalyticsResponse = {
      posts_views,
      category_distribution,
      source_distribution,
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Admin Analytics API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && {
          details: errorMessage,
        }),
      },
      { status: 500 },
    );
  }
}
