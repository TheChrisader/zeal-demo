import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { NextRequest, NextResponse } from "next/server";
import { CATEGORIES } from "@/categories/flattened";
import {
  AnalyticsQuerySchema,
  Timeframe,
} from "@/database/analytics/analytics.dto";
import { getTotalViewsByAllCategories } from "@/database/page-stats/page-stats.repository";
import PostModel from "@/database/post/post.model";

export const revalidate = 60 * 5;

interface CategoryTotalViews {
  category: string;
  total_views: number;
}

interface AnalyticsResponse {
  posts_views: FormattedAnalyticsData[];
  category_distribution: CategoryDistribution[];
  source_distribution: SourceDistribution[];
  total_user_visits: string;
  category_total_views: CategoryTotalViews[];
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
 * Gets date range based on specified timeframe
 * @param timeframe - The timeframe period ('1d', '7d', '30d')
 * @returns Object with start and end Date objects for the timeframe
 */
function getDateRange(timeframe: Timeframe) {
  const now = new Date();
  let startDate: Date, endDate: Date;

  switch (timeframe) {
    case "1d":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "7d":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "30d":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
  }

  // Apply timezone adjustment (-1 hour to maintain existing behavior)
  startDate.setHours(startDate.getHours() - 1);
  endDate.setHours(endDate.getHours() - 1);

  return { startDate, endDate };
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
 * Creates the Google Analytics total users query configuration
 * @param propertyId - The GA4 property ID
 * @param timeframe - The timeframe period ('1d', '7d', '30d')
 * @returns The GA report request configuration for total users aggregation
 */
function createTotalUsersQuery(propertyId: string, timeframe: Timeframe) {
  const { startDate, endDate } = getDateRange(timeframe);

  // Convert dates to YYYY-MM-DD format for GA API
  const gaStartDate = startDate.toISOString().split("T")[0];
  const gaEndDate = endDate.toISOString().split("T")[0];

  return {
    property: `properties/${propertyId}`,
    dateRanges: [
      {
        startDate: gaStartDate,
        endDate: gaEndDate,
      },
    ],
    dimensions: [], // Empty for total aggregation
    metrics: [
      {
        name: "totalUsers",
      },
    ],
    // No limit needed for aggregation
    dimensionFilter: {
      andGroup: {
        expressions: [
          {
            notExpression: {
              filter: {
                fieldName: "country",
                stringFilter: {
                  matchType: "EXACT" as const,
                  value: "Singapore",
                  caseSensitive: false,
                },
              },
            },
          },
          {
            notExpression: {
              filter: {
                fieldName: "city",
                stringFilter: {
                  matchType: "EXACT" as const,
                  value: "Lanzhou",
                  caseSensitive: false,
                },
              },
            },
          },
        ],
      },
    },
  };
}

/**
 * Creates the Google Analytics query configuration
 * @param propertyId - The GA4 property ID
 * @param timeframe - The timeframe period ('1d', '7d', '30d')
 * @returns The GA report request configuration
 */
function createAnalyticsQuery(propertyId: string, timeframe: Timeframe) {
  const { startDate, endDate } = getDateRange(timeframe);

  // Convert dates to YYYY-MM-DD format for GA API
  const gaStartDate = startDate.toISOString().split("T")[0];
  const gaEndDate = endDate.toISOString().split("T")[0];

  return {
    property: `properties/${propertyId}`,
    dateRanges: [
      {
        startDate: gaStartDate,
        endDate: gaEndDate,
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
 * @param timeframe - The timeframe period ('1d', '7d', '30d')
 * @returns Promise resolving to the GA response data
 */
async function fetchGoogleAnalyticsData(
  propertyId: string,
  timeframe: Timeframe,
) {
  const analyticsDataClient = new BetaAnalyticsDataClient();
  const query = createAnalyticsQuery(propertyId, timeframe);

  console.log(
    "Running report for property:",
    propertyId,
    "timeframe:",
    timeframe,
  );

  const [response] = await analyticsDataClient.runReport(query);
  return response as GoogleAnalyticsResponse;
}

/**
 * Fetches total users from Google Analytics for the specified property
 * @param propertyId - The GA4 property ID
 * @param timeframe - The timeframe period ('1d', '7d', '30d')
 * @returns Promise resolving to total users count as string
 */
async function fetchTotalUsers(
  propertyId: string,
  timeframe: Timeframe,
): Promise<string> {
  const analyticsDataClient = new BetaAnalyticsDataClient();
  const query = createTotalUsersQuery(propertyId, timeframe);

  console.log(
    "Running total users report for property:",
    propertyId,
    "timeframe:",
    timeframe,
  );

  const [response] = await analyticsDataClient.runReport(query);

  // totalUsers will be at metric index 0 since it's the only metric
  return response.rows?.[0]?.metricValues?.[0]?.value || "0";
}

/**
 * Fetches category distribution from MongoDB
 * @param startDate - Start date for the timeframe (Date object)
 * @param endDate - End date for the timeframe (Date object)
 * @returns Promise resolving to category distribution data
 */
async function fetchCategoryDistribution(startDate: Date, endDate: Date) {
  return PostModel.aggregate([
    {
      $match: {
        category: { $in: CATEGORIES },
        published_at: {
          $gte: startDate,
          $lte: endDate,
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
 * @param startDate - Start date for the timeframe (Date object)
 * @param endDate - End date for the timeframe (Date object)
 * @returns Promise resolving to source distribution data
 */
async function fetchSourceDistribution(startDate: Date, endDate: Date) {
  return PostModel.aggregate([
    {
      $match: {
        source_type: { $in: SOURCE_TYPES },
        published_at: {
          $gte: startDate,
          $lte: endDate,
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
 * Fetches category total views from page-stats collection using optimized single query
 * @param categories - Array of category names to include in response
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Promise resolving to category total views data with all categories included
 */
async function fetchCategoryTotalViews(
  categories: string[],
  startDate: string,
  endDate: string,
): Promise<CategoryTotalViews[]> {
  // Get all categories with views in a single database call
  const categoryStatsFromDb = await getTotalViewsByAllCategories(
    startDate,
    endDate,
  );

  // Create a Map for quick lookup
  const statsMap = new Map(
    categoryStatsFromDb.map((item) => [item.category, item.totalViews]),
  );

  // Ensure all categories from CATEGORIES are included, even if they have zero views
  return categories.map((category) => ({
    category,
    total_views: statsMap.get(category) || 0,
  }));
}

/**
 * Transforms category total views to match existing interface format
 * @param categoryTotalViews - Raw page-stats aggregation result
 * @returns Formatted category total views array
 */
function formatCategoryTotalViews(
  categoryTotalViews: CategoryTotalViews[],
): CategoryTotalViews[] {
  return categoryTotalViews.map((item) => ({
    category: item.category,
    total_views: item.total_views,
  }));
}

/**
 * Analytics API endpoint that fetches and combines data from Google Analytics and MongoDB
 * @param request - Next.js request object
 * @returns Promise resolving to analytics response with formatted data
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<AnalyticsResponse | { error: string }>> {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID;

    if (!propertyId) {
      throw new Error("GA4_PROPERTY_ID is not set in environment variables.");
    }

    // Parse and validate timeframe parameter
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "1d";

    const validationResult = AnalyticsQuerySchema.safeParse({ timeframe });
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid timeframe parameter. Allowed values: 1d, 7d, 30d",
          ...(process.env.NODE_ENV === "development" && {
            details: validationResult.error.errors,
          }),
        },
        { status: 400 },
      );
    }

    const { timeframe: validatedTimeframe } = validationResult.data;
    const { startDate, endDate } = getDateRange(validatedTimeframe);

    // Convert dates to YYYY-MM-DD format for page-stats API
    const pageStatsStartDate = startDate.toISOString().split("T")[0];
    const pageStatsEndDate = endDate.toISOString().split("T")[0];

    // Fetch all data in parallel for optimal performance
    const [
      gaResponse,
      totalUserVisits,
      categoryDistribution,
      sourceDistribution,
      categoryTotalViews,
    ] = await Promise.all([
      fetchGoogleAnalyticsData(propertyId, validatedTimeframe),
      fetchTotalUsers(propertyId, validatedTimeframe),
      fetchCategoryDistribution(startDate, endDate),
      fetchSourceDistribution(startDate, endDate),
      fetchCategoryTotalViews(
        CATEGORIES,
        pageStatsStartDate as string,
        pageStatsEndDate as string,
      ),
    ]);

    // Use property-wide total users from separate query
    const total_user_visits = totalUserVisits;

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
    const category_total_views = formatCategoryTotalViews(categoryTotalViews);

    const responseData: AnalyticsResponse = {
      posts_views,
      category_distribution,
      source_distribution,
      total_user_visits,
      category_total_views,
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
