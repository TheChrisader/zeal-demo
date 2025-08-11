import { NextResponse } from "next/server";
import { NewPostData } from "@/lib/scoring"; // We can reuse this type
import { connectToDatabase } from "@/lib/database";
import PostModel from "@/database/post/post.model";
import {
  SCORE_CONFIG,
  TIER_ONE_PROMOTED_CATEGORIES,
} from "@/constants/score-config";
import { revalidateTag } from "next/cache";

// --- NOTE: You should move SCORE_CONFIG into its own file to share it ---
// Create a new file `lib/scoring-config.ts` and export SCORE_CONFIG from there.
// Then import it here and in `lib/scoring.ts`.

export async function POST(request: Request) {
  // 1. --- SECURITY: PROTECT THE ROUTE ---
  const { searchParams } = new URL(request.url);
  // if (searchParams.get("secret") !== process.env.CRON_SECRET) {
  //   return NextResponse.json(
  //     { message: "Unauthorized: Invalid secret." },
  //     { status: 401 },
  //   );
  // }

  try {
    await connectToDatabase();

    // 2. --- DEFINE SCOPE ---
    // const daysToProcess = parseInt(searchParams.get("days") || "30", 10);
    const daysToProcess = 10;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToProcess);

    console.log(
      `Backfilling scores for posts from the last ${daysToProcess} days...`,
    );

    // 3. --- FETCH UNSCORED POSTS ---
    // Fetch all posts in the date range where initial_score is 0 or doesn't exist.
    // Sort by publish date ASC to process them in the order they were created.
    const postsToUpdate = await PostModel.find({
      published_at: { $gte: startDate },
      generatedBy: "user",
      // $or: [{ initial_score: { $exists: false } }, { initial_score: 0 }],
    })
      .sort({ published_at: 1 }) // CRITICAL: Process oldest to newest
      .select("content keywords image_url source_type published_at category") // Fetch only needed fields
      .lean();

    if (postsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No posts found to update.",
      });
    }

    console.log(`Found ${postsToUpdate.length} posts to process.`);

    const bulkOps = [];

    // 4. --- PROCESS POSTS IN A LOOP ---
    // We are re-implementing the scoring logic here because we need to compare
    // against an in-memory list of previously processed posts, not the DB.
    for (let i = 0; i < postsToUpdate.length; i++) {
      const post = postsToUpdate[i];
      if (!post) continue;
      console.log(`Processing post #${i + 1}...`);
      const postData: NewPostData = {
        content: post.content,
        category: post.category,
        keywords: post.keywords,
        image_url: post.image_url ?? undefined,
        source_type: post.source_type,
      };

      // --- RICHNESS CALCULATION (copied from lib/scoring.ts) ---
      let richnessMultiplier = 1.0;
      const wordCount = (postData.content.match(/\S+/g) || []).length;
      if (wordCount > 300)
        richnessMultiplier *= SCORE_CONFIG.richness.wordCount.long;
      else if (wordCount > 150)
        richnessMultiplier *= SCORE_CONFIG.richness.wordCount.medium;

      const totalImages =
        (postData.content.match(/<img/gi) || []).length +
        (postData.image_url ? 1 : 0);
      if (totalImages >= 6)
        richnessMultiplier *= SCORE_CONFIG.richness.imageBonus.tier3;
      else if (totalImages >= 3)
        richnessMultiplier *= SCORE_CONFIG.richness.imageBonus.tier2;
      else if (totalImages >= 1)
        richnessMultiplier *= SCORE_CONFIG.richness.imageBonus.tier1;

      const subheadingCount = (postData.content.match(/<h[2-6]/gi) || [])
        .length;
      if (subheadingCount >= 10)
        richnessMultiplier *= SCORE_CONFIG.richness.subheadingBonus.tier3;
      else if (subheadingCount >= 5)
        richnessMultiplier *= SCORE_CONFIG.richness.subheadingBonus.tier2;
      else if (subheadingCount >= 2)
        richnessMultiplier *= SCORE_CONFIG.richness.subheadingBonus.tier1;

      if (
        TIER_ONE_PROMOTED_CATEGORIES.find((cat) => post.category.includes(cat))
      ) {
        richnessMultiplier *= SCORE_CONFIG.richness.categoryBonus.tier1;
      }

      // --- NOVELTY CALCULATION (in-memory version) ---
      let noveltyMultiplier = 1.0;
      const newPostKeywords = new Set(postData.keywords);
      if (newPostKeywords.size > 0) {
        // Compare against posts that came *before* it in this batch
        const previousPosts = postsToUpdate.slice(0, i);
        for (const oldPost of previousPosts) {
          const oldPostKeywords = new Set(oldPost.keywords);
          const intersection = new Set(
            [...newPostKeywords].filter((k) => oldPostKeywords.has(k)),
          );
          const similarity =
            intersection.size /
            Math.min(newPostKeywords.size, oldPostKeywords.size);
          if (similarity > SCORE_CONFIG.novelty.similarityThreshold) {
            noveltyMultiplier = SCORE_CONFIG.novelty.redundancyPenalty;
            break;
          }
        }
      }

      // --- CALCULATE FINAL SCORES ---
      const baseScore = SCORE_CONFIG.base[postData.source_type ?? "auto"];
      const initial_score = Math.round(
        baseScore * richnessMultiplier * noveltyMultiplier,
      );

      // Also calculate the current prominence score
      const hoursSincePublication =
        (new Date().getTime() - new Date(post.published_at).getTime()) /
        (1000 * 60 * 60);
      const decayConstant =
        SCORE_CONFIG.timelinessDecay[post.source_type ?? "auto"];
      const timelinessMultiplier = Math.exp(
        -decayConstant * hoursSincePublication,
      );
      const prominence_score = Math.round(initial_score * timelinessMultiplier);

      // Add the update operation to our bulk list
      bulkOps.push({
        updateOne: {
          filter: { _id: post._id },
          update: {
            $set: {
              initial_score,
              prominence_score,
              source_type: "user",
            },
          },
        },
      });
    }

    // 5. --- EXECUTE DATABASE UPDATE ---
    if (bulkOps.length > 0) {
      console.log(`Writing ${bulkOps.length} documents to database...`);
      await PostModel.bulkWrite(bulkOps);
    }

    await revalidateTag("frontpage");

    return NextResponse.json({
      success: true,
      message: `Successfully processed and updated ${bulkOps.length} posts.`,
    });
  } catch (error: any) {
    console.error("Backfill script failed:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
