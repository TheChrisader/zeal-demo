import { XMLBuilder } from "fast-xml-parser";
import { format } from "date-fns";
import { RSSFeed, RSSItem } from "@/types/rss.type";
import { unstable_cache } from "next/cache";

const RSS_CACHE_TAG = "rss-feed";
const RSS_CACHE_KEY = "rss-feed-data";

interface RSSChannel {
  title: string;
  description: string;
  link: string;
  language: string;
  lastBuildDate: string;
  generator: string;
  item: RSSItem[];
}

interface RSSData {
  rss: {
    "@version": "2.0";
    channel: RSSChannel;
  };
}

const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const generateRSSXml = (feed: RSSFeed): string => {
  const rssItems: RSSItem[] = feed.items.map((item) => ({
    title: escapeXml(item.title),
    description: escapeXml(item.description),
    link: item.link,
    guid: item.guid,
    pubDate: format(item.pubDate, "EEE, dd MMM yyyy HH:mm:ss xx"),
    author: item.author ? escapeXml(item.author) : undefined,
    image: item.image
      ? {
          url: escapeXml(item.image.url),
          title: item.image.title ? escapeXml(item.image.title) : undefined,
        }
      : undefined,
  }));

  const rssData: RSSData = {
    rss: {
      "@version": "2.0",
      channel: {
        title: escapeXml(feed.title),
        description: escapeXml(feed.description),
        link: feed.link,
        language: feed.language,
        lastBuildDate: format(feed.lastBuildDate, "EEE, dd MMM yyyy HH:mm:ss xx"),
        generator: feed.generator,
        item: rssItems,
      },
    },
  };

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@",
    format: true,
  });

  return builder.build(rssData);
};

export const generateRSSFeed = async (
  feedData: RSSFeed
): Promise<{ xml: string; lastModified: Date }> => {
  const xml = generateRSSXml(feedData);
  return {
    xml,
    lastModified: new Date(),
  };
};

export const getCachedRSSFeed = unstable_cache(
  async () => {
    // This will be implemented by the RSS API route
    return null;
  },
  [RSS_CACHE_KEY],
  {
    revalidate: 1 * 60 * 60, // 1 hour
    tags: [RSS_CACHE_TAG],
  }
);

export const RSS_HEADERS = {
  "Content-Type": "application/rss+xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
};