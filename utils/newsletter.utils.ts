import PostModel from "@/database/post/post.model";
import { Id } from "@/lib/database";
import { EmailArticle } from "@/types/newsletter.type";
import { IPost } from "@/types/post.type";

export function adaptArticle(
  doc: IPost,
  isSnapshot = false,
  campaignId: string | null = null,
): EmailArticle {
  const DOMAIN = process.env.NEXT_PUBLIC_APP_URL;

  // 1. Build the raw destination URL
  let finalUrl = `${DOMAIN}/en/post/${doc.slug}`;

  // 2. Link Wrapping Logic
  if (isSnapshot && campaignId) {
    // If we are locking this for send, we wrap the link for click tracking.
    // Notice {{UID}}: We don't know the user ID yet, so we use a placeholder.
    // const encodedDest = encodeURIComponent(finalUrl);
    // finalUrl = `${DOMAIN}/api/newsletter/track/click?cid=${campaignId}&uid={{UID}}&dest=${encodedDest}`;
    finalUrl += `?utm_source=newsletter&utm_medium=email`; //TODO
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

/**
 * Selects post IDs from categories, distributing evenly across passes.
 *
 * @param categories - Array of category names to pull from
 * @param categoryPostMapping - Object mapping category names to arrays of post IDs
 * @param targetCount - Target number of total post IDs to return (default: 15)
 * @returns Array of randomly selected post IDs
 */
export function selectPostIdsFromCategories(
  categories: readonly string[],
  categoryPostMapping: Record<string, (string | Id)[]>,
  targetCount: number = 15,
): string[] {
  const selectedIds: string[] = [];
  const takenFromCategory: Record<string, number> = {};

  // Shuffle each category's IDs upfront for randomness
  const shuffledMapping: Record<string, string[]> = {};
  for (const [cat, ids] of Object.entries(categoryPostMapping)) {
    shuffledMapping[cat] = shuffleArray([...ids.map((id) => id.toString())]);
  }

  // Multiple passes: take 1 from each category per pass
  while (selectedIds.length < targetCount) {
    let addedAny = false;

    for (const category of categories) {
      if (selectedIds.length >= targetCount) break;

      const shuffled = shuffledMapping[category];
      if (!shuffled || shuffled.length === 0) continue;

      const takenSoFar = takenFromCategory[category] ?? 0;
      if (takenSoFar >= shuffled.length) continue;

      const postId = shuffled[takenSoFar];
      if (!postId) continue; // Strict null check for array access

      selectedIds.push(postId);
      takenFromCategory[category] = takenSoFar + 1;
      addedAny = true;
    }

    if (!addedAny) break; // No more posts available
  }

  return selectedIds;
}

/**
 * Fisher-Yates shuffle for random selection (non-mutating)
 */
function shuffleArray<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}
