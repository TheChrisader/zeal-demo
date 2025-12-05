import PostModel from "@/database/post/post.model";
import { Id } from "@/lib/database";
import { EmailArticle } from "@/types/newsletter.type";
import { IPost } from "@/types/post.type";

export function adaptArticle(
  doc: IPost,
  isSnapshot = false,
  campaignId: string | null = null,
): EmailArticle {
  const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL;

  // 1. Build the raw destination URL
  let finalUrl = `${DOMAIN}/articles/${doc.slug}`;

  // 2. Link Wrapping Logic
  if (isSnapshot && campaignId) {
    // If we are locking this for send, we wrap the link for click tracking.
    // Notice {{UID}}: We don't know the user ID yet, so we use a placeholder.
    const encodedDest = encodeURIComponent(finalUrl);
    finalUrl = `${DOMAIN}/api/newsletter/track/click?cid=${campaignId}&uid={{UID}}&dest=${encodedDest}`;
  } else {
    // If this is just for preview, add UTM params for analytics visibility
    finalUrl += `?utm_source=newsletter&utm_medium=email`;
  }

  // 3. Fallbacks and Formatting
  return {
    title: doc.title,
    // Truncate excerpt to 120 chars to prevent layout breaking
    excerpt: (doc.description || "").substring(0, 120) + "...",
    url: finalUrl,
    category: doc.category[0] as string,
    // Use a default image if none exists
    thumbnailUrl:
      doc.image_url || `${DOMAIN}/static/newsletter-placeholder.png`,
    dateStr: new Date(doc.published_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  };
}

/**
 * Fetches articles by ID, sorts them to match the input array,
 * and adapts them for the campaign view.
 */
export async function prepareCampaignView(
  articleIds: string[],
  isSnapshot: boolean,
  campaignId: string | null = null,
) {
  // 1. Fetch all requested articles
  // Optimization: Only select fields we actually need
  const rawDocs = await PostModel.find({ _id: { $in: articleIds } })
    .select("title slug description image_url category published_at")
    .lean(); // .lean() returns plain JS objects, faster than Mongoose docs

  // 2. Sort them to match the specific order of 'articleIds' (The Admin's choice)
  const sortedDocs = articleIds
    .map((id) => rawDocs.find((doc) => doc._id.toString() === id.toString()))
    .filter(Boolean); // Filter out any nulls (deleted articles)

  if (sortedDocs.length === 0) {
    throw new Error("No valid articles found");
  }

  // 3. Adapt them
  const adaptedArticles = sortedDocs.map((doc) =>
    adaptArticle(doc as IPost, isSnapshot, campaignId),
  );

  // 4. Return all articles as a single array
  return {
    articles: adaptedArticles,
  };
}

/**
 * Prepares campaign content based on template type
 */
export async function prepareCampaignContent(
  templateId: "standard" | "custom",
  articleIds: string[] | undefined,
  bodyContent: string | undefined,
  isSnapshot: boolean = false,
  campaignId: string | null = null,
) {
  if (templateId === "standard") {
    if (!articleIds || articleIds.length === 0) {
      throw new Error("Standard template requires at least one article");
    }

    return await prepareCampaignView(articleIds, isSnapshot, campaignId);
  } else if (templateId === "custom") {
    if (!bodyContent || !bodyContent.trim()) {
      throw new Error("Custom template requires body content");
    }

    return {
      bodyContent: bodyContent.trim(),
    };
  }

  throw new Error("Invalid template type");
}

/**
 * Validates campaign content based on template type
 */
export function validateCampaignContent(
  templateId: "standard" | "custom",
  articleIds: string[] | undefined,
  bodyContent: string | undefined,
): { isValid: boolean; error?: string } {
  if (templateId === "standard") {
    if (!articleIds || articleIds.length === 0) {
      return {
        isValid: false,
        error: "Standard template requires at least one article",
      };
    }
    return { isValid: true };
  } else if (templateId === "custom") {
    if (!bodyContent || !bodyContent.trim()) {
      return { isValid: false, error: "Custom template requires body content" };
    }
    return { isValid: true };
  }

  return { isValid: false, error: "Invalid template type" };
}
