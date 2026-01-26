import { XMLParser } from "fast-xml-parser";
import { unstable_cache } from "next/cache";

export interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
}

async function fetchLatestVideos(
  channelUrl: string,
): Promise<YouTubeVideo[]> {
  const res = await fetch(channelUrl, { cache: "force-cache" });
  const html = await res.text();
  const match = html.match(/channel_id=([^"]+)/);
  const channelId = match ? match[1] : null;
  if (!channelId) throw new Error("Channel ID not found");

  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const feedRes = await fetch(feedUrl);
  const xml = await feedRes.text();

  const parser = new XMLParser();
  const parsed = parser.parse(xml);

  return parsed.feed.entry
    .slice(0, 3)
    .map((entry: { title: string; "yt:videoId": string }) => ({
      id: entry["yt:videoId"],
      title: entry.title,
      url: `https://www.youtube.com/watch?v=${entry["yt:videoId"]}`,
    }));
}

export const getLatestVideos = (channelUrl: string) =>
  unstable_cache(
    async () => fetchLatestVideos(channelUrl),
    [`youtube-videos-${channelUrl}`],
    {
      revalidate: 60 * 60 * 1,
    },
  )();
