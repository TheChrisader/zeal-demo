import { IPost } from "@/types/post.type";
import { RSSItem } from "@/types/rss.type";
import { connectToDatabase } from "@/lib/database";

const RSS_FEED_SIZE = 20;

export async function getLatestPostsForRSS(): Promise<RSSItem[]> {
  try {
    await connectToDatabase();

    // Import PostModel dynamically to avoid loading when not needed
    const PostModel = (await import("@/database/post/post.model")).default;

    // Fetch latest 20 published posts
    const posts = await PostModel.find({
      published: true,
      status: "active",
    })
      .select(
        "title description slug published_at author_id image_url source name language"
      )
      .sort({ published_at: -1 })
      .limit(RSS_FEED_SIZE)
      .lean()
      .exec();

    // Transform posts to RSS items
    const rssItems: RSSItem[] = posts.map((post: IPost) => ({
      title: post.title,
      description: post.description || post.title,
      link: `https://zealnews.africa/post/${post.slug}`,
      guid: `https://zealnews.africa/post/${post.slug}`,
      pubDate: new Date(post.published_at),
      author: post.source?.name || undefined,
      image: post.image_url
        ? {
            url: post.image_url,
            title: post.title,
          }
        : undefined,
    }));

    return rssItems;
  } catch (error) {
    console.error("Error fetching latest posts for RSS:", error);
    // Return empty array on error to ensure RSS feed is always available
    return [];
  }
}