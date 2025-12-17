import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import { connectToDatabase } from "@/lib/database";
import { IPost } from "@/types/post.type";

const SITEMAP_CACHE_TAG = "sitemap-data";
const SITEMAP_CACHE_KEY = "sitemap-entries";
const BASE_URL = "https://zealnews.africa";

// Define the type for sitemap entries
type SitemapEntry = {
  url: string;
  lastModified: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
  alternates: {
    languages: {
      en: string;
      fr: string;
    };
  };
};

// Background function to generate and cache sitemap data
async function generateSitemapData(): Promise<void> {
  try {
    console.log("Starting sitemap generation in background...");

    // Connect to database
    await connectToDatabase();

    // Batch configuration
    const BATCH_SIZE = 1000;
    let skip = 0;
    const allArticles: IPost[] = [];
    let hasMore = true;

    // Fetch all published posts in batches
    while (hasMore) {
      console.log(`Fetching batch with skip=${skip}, limit=${BATCH_SIZE}`);

      const articles = await PostModel.find({
        published: true,
        status: "active",
      })
        .select("slug updated_at published_at")
        .sort({ published_at: -1 })
        .skip(skip)
        .limit(BATCH_SIZE)
        .lean()
        .exec();

      if (articles.length === 0) {
        hasMore = false;
      } else {
        allArticles.push(...articles);
        skip += BATCH_SIZE;
        console.log(
          `Fetched ${articles.length} articles, total so far: ${allArticles.length}`,
        );

        // Add a small delay to prevent overwhelming the database
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(`Fetched total of ${allArticles.length} articles for sitemap`);

    // Generate sitemap entries for articles
    const articleEntries: SitemapEntry[] = [];

    // Process in smaller chunks to avoid memory issues
    const CHUNK_SIZE = 500;
    for (let i = 0; i < allArticles.length; i += CHUNK_SIZE) {
      const chunk = allArticles.slice(i, i + CHUNK_SIZE);

      chunk.forEach((article: IPost) => {
        const lastModified = new Date(
          article.updated_at || article.published_at,
        );

        // English version
        articleEntries.push({
          url: `${BASE_URL}/en/post/${article.slug}`,
          lastModified: lastModified.toISOString(),
          changeFrequency: "never",
          priority: 0.7,
          alternates: {
            languages: {
              en: `${BASE_URL}/en/post/${article.slug}`,
              fr: `${BASE_URL}/fr/post/${article.slug}`,
            },
          },
        });

        // French version
        articleEntries.push({
          url: `${BASE_URL}/fr/post/${article.slug}`,
          lastModified: lastModified.toISOString(),
          changeFrequency: "never",
          priority: 0.7,
          alternates: {
            languages: {
              en: `${BASE_URL}/en/post/${article.slug}`,
              fr: `${BASE_URL}/fr/post/${article.slug}`,
            },
          },
        });
      });

      console.log(
        `Processed chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(allArticles.length / CHUNK_SIZE)}`,
      );
    }

    // Cache the sitemap data
    const cacheData = {
      articles: articleEntries,
      lastGenerated: new Date().toISOString(),
      count: allArticles.length,
    };

    // Use unstable_cache to store the data with a 24-hour revalidation
    await unstable_cache(async () => cacheData, [SITEMAP_CACHE_KEY], {
      revalidate: 86400, // 24 hours
      tags: [SITEMAP_CACHE_TAG],
    })();

    console.log(
      `Successfully cached ${allArticles.length} articles for sitemap (${articleEntries.length} total URLs)`,
    );
  } catch (error) {
    console.error("Error in background sitemap generation:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify cron authorization
    // const authHeader = request.headers.get("authorization");
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Start the background process without awaiting
    generateSitemapData().catch((error) => {
      console.error("Background sitemap generation failed:", error);
    });

    // Return immediately
    return NextResponse.json({
      success: true,
      message: "Sitemap generation started in background",
    });
  } catch (error) {
    console.error("Error starting sitemap generation:", error);
    return NextResponse.json(
      {
        error: "Failed to start sitemap generation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Support GET requests for manual triggering (with auth)
export async function GET(request: NextRequest) {
  return POST(request);
}
