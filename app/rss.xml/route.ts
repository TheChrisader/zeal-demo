import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { format } from "date-fns";
import { getLatestPostsForRSS } from "@/lib/rss-queries";
import { generateRSSFeed, RSS_HEADERS } from "@/lib/rss-generator";
import { RSSFeed } from "@/types/rss.type";

const RSS_CACHE_TAG = "rss-feed";
const RSS_CACHE_KEY = "rss-feed-data";
const BASE_URL = "https://zealnews.africa";

// Cached function to generate RSS feed
const generateCachedRSSFeed = unstable_cache(
  async (): Promise<{ xml: string; lastModified: Date }> => {
    try {
      console.log("Generating RSS feed...");

      // Fetch latest posts for RSS
      const items = await getLatestPostsForRSS();

      // Create RSS feed data
      const feedData: RSSFeed = {
        title: "Zeal News Africa",
        description: "Latest news from across Africa",
        link: BASE_URL,
        language: "en",
        lastBuildDate: new Date(),
        generator: "Zeal News Africa RSS Generator",
        items,
      };

      // Generate RSS XML
      const { xml } = await generateRSSFeed(feedData);

      console.log(`Generated RSS feed with ${items.length} items`);
      return { xml, lastModified: new Date() };
    } catch (error) {
      console.error("Error generating RSS feed:", error);
      // Return empty RSS feed on error
      const emptyFeed: RSSFeed = {
        title: "Zeal News Africa",
        description: "Latest news from across Africa",
        link: BASE_URL,
        language: "en",
        lastBuildDate: new Date(),
        generator: "Zeal News Africa RSS Generator",
        items: [],
      };

      const { xml } = await generateRSSFeed(emptyFeed);
      return { xml, lastModified: new Date() };
    }
  },
  [RSS_CACHE_KEY],
  {
    revalidate: 1 * 60 * 60, // 1 hour
    tags: [RSS_CACHE_TAG],
  }
);

// Handle GET requests for RSS feed
export async function GET() {
  try {
    // Generate or get cached RSS feed
    const { xml } = await generateCachedRSSFeed();

    // Return RSS XML with proper headers
    return new NextResponse(xml, {
      status: 200,
      headers: RSS_HEADERS,
    });
  } catch (error) {
    console.error("Error serving RSS feed:", error);
    // Return empty RSS feed on error
    const emptyFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Zeal News Africa</title>
    <description>Latest news from across Africa</description>
    <link>${BASE_URL}</link>
    <language>en</language>
    <lastBuildDate>${format(new Date(), "EEE, dd MMM yyyy HH:mm:ss xx")}</lastBuildDate>
    <generator>Zeal News Africa RSS Generator</generator>
  </channel>
</rss>`;

    return new NextResponse(emptyFeed, {
      status: 200,
      headers: RSS_HEADERS,
    });
  }
}