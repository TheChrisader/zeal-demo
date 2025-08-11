import {
  SCORE_CONFIG,
  TIER_ONE_PROMOTED_CATEGORIES,
} from "@/constants/score-config";
import PostModel from "@/database/post/post.model";

/**
 * A data structure for the object passed to calculateInitialScore.
 * This ensures we have all the data needed before a post is saved.
 */
export interface NewPostData {
  content: string;
  keywords: string[];
  category: string[];
  image_url?: string;
  source_type?: "user" | "auto";
}

/**
 * HEAVY: Calculates the initial and prominence scores for a brand new post.
 * This should be called ONLY ONCE, right before the post is created.
 * It performs an expensive database query to check for novelty.
 *
 * @param data The data of the new post being created.
 * @returns An object with the initial_score and prominence_score.
 */
export async function calculateInitialScore(
  data: NewPostData,
): Promise<{ initial_score: number; prominence_score: number }> {
  if (!data.source_type) {
    data.source_type = "auto";
  }
  // 1. Get Base Score from the source type
  const baseScore =
    SCORE_CONFIG.base[data.source_type] || SCORE_CONFIG.base.auto;

  // 2. Calculate Richness Multiplier
  let richnessMultiplier = 1.0;

  // Word count calculation (derived from content)
  const wordCount = data.content.replace(/<[^>]*>?/gm, "").split(/\s+/).length;
  if (wordCount > 300) {
    richnessMultiplier *= SCORE_CONFIG.richness.wordCount.long;
  } else if (wordCount > 150) {
    richnessMultiplier *= SCORE_CONFIG.richness.wordCount.medium;
  }

  // Image check
  // Count images embedded in the article content
  const imageTagsInContent = (data.content.match(/<img/gi) || []).length;

  // Also consider the main `image_url` if it exists and isn't already in the content
  // (A simple check to avoid double-counting the featured image)
  let totalImages = imageTagsInContent;
  if (data.image_url && !data.content.includes(data.image_url)) {
    totalImages += 1;
  }

  // Apply the tiered bonus based on the total image count
  if (totalImages >= 6) {
    richnessMultiplier *= SCORE_CONFIG.richness.imageBonus.tier3;
  } else if (totalImages >= 3) {
    richnessMultiplier *= SCORE_CONFIG.richness.imageBonus.tier2;
  } else if (totalImages >= 1) {
    richnessMultiplier *= SCORE_CONFIG.richness.imageBonus.tier1;
  }

  // Subheading check (derived from content)
  // Count subheading tags (h2, h3, h4, h5, h6) in the content
  const subheadingCount = (data.content.match(/<h[2-6]/gi) || []).length;

  // Apply the tiered bonus based on the subheading count
  if (subheadingCount >= 10) {
    richnessMultiplier *= SCORE_CONFIG.richness.subheadingBonus.tier3;
  } else if (subheadingCount >= 5) {
    richnessMultiplier *= SCORE_CONFIG.richness.subheadingBonus.tier2;
  } else if (subheadingCount >= 2) {
    richnessMultiplier *= SCORE_CONFIG.richness.subheadingBonus.tier1;
  }

  if (TIER_ONE_PROMOTED_CATEGORIES.find((cat) => data.category.includes(cat))) {
    richnessMultiplier *= SCORE_CONFIG.richness.categoryBonus.tier1;
  }

  // 3. Calculate Novelty Multiplier (The Database-Intensive Part)
  let noveltyMultiplier = 1.0;
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  // Efficiently fetch ONLY the keywords of recent posts
  const recentPosts = await PostModel.find(
    { published_at: { $gte: twentyFourHoursAgo } },
    "keywords", // This projection is VITAL for performance
  ).lean();

  const newPostKeywords = new Set(data.keywords);
  if (newPostKeywords.size > 0) {
    for (const otherPost of recentPosts) {
      const otherPostKeywords = new Set(otherPost.keywords);
      if (otherPostKeywords.size === 0) continue;

      const intersection = new Set(
        [...newPostKeywords].filter((k) => otherPostKeywords.has(k)),
      );

      // Jaccard Similarity variant: intersection over the smaller set size
      const similarity =
        intersection.size /
        Math.min(newPostKeywords.size, otherPostKeywords.size);

      if (similarity > SCORE_CONFIG.novelty.similarityThreshold) {
        noveltyMultiplier = SCORE_CONFIG.novelty.redundancyPenalty;
        break; // Found a redundant post, no need to check further
      }
    }
  }

  // 4. Calculate Final Initial Score
  const initial_score = Math.round(
    baseScore * richnessMultiplier * noveltyMultiplier,
  );

  // At the moment of creation, prominence_score is the same as initial_score
  return { initial_score, prominence_score: initial_score };
}

/**
 * LIGHTWEIGHT: Recalculates the prominence score for an existing post.
 * This is cheap and does NOT touch the database. It should be used in the cron job.
 *
 * @param post An object containing the necessary fields from an existing post.
 * @returns The new prominence_score.
 */
export function recalculateProminence(post: {
  initial_score: number;
  published_at: string | Date;
  source_type?: "user" | "auto";
}): number {
  const hoursSincePublication =
    (new Date().getTime() - new Date(post.published_at).getTime()) /
    (1000 * 60 * 60);
  if (hoursSincePublication < 0) {
    return post.initial_score;
  }
  if (!post.source_type) {
    post.source_type = "auto";
  }
  const decayConstant =
    SCORE_CONFIG.timelinessDecay[post.source_type] ||
    SCORE_CONFIG.timelinessDecay.auto;

  // The core decay formula
  const timelinessMultiplier = Math.exp(-decayConstant * hoursSincePublication);

  const newProminenceScore = Math.round(
    post.initial_score * timelinessMultiplier,
  );

  return newProminenceScore;
}
