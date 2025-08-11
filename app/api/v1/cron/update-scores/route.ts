import { NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import { connectToDatabase } from "@/lib/database";
import { recalculateProminence } from "@/lib/scoring"; // Import the lightweight function
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  // Secure the cron job with a secret key stored in your environment variables
  //   const { searchParams } = new URL(request.url);
  //   if (searchParams.get('secret') !== process.env.CRON_SECRET) {
  //     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  //   }

  await connectToDatabase();

  try {
    // Fetch only posts from the last 7 days. Older posts' scores are near zero anyway.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Efficiently fetch ONLY the fields needed for recalculation
    const postsToUpdate = await PostModel.find(
      { published_at: { $gte: sevenDaysAgo }, generatedBy: "user" },
      "initial_score published_at source_type",
    ).lean();

    if (postsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No posts to update.",
      });
    }

    // Use bulkWrite for a single, efficient database operation
    const bulkOps = postsToUpdate.map((post) => {
      const newScore = recalculateProminence(post);
      return {
        updateOne: {
          filter: { _id: post._id },
          update: { $set: { prominence_score: newScore } },
        },
      };
    });

    await PostModel.bulkWrite(bulkOps);

    await revalidateTag("frontpage");

    return NextResponse.json({ success: true, updated: bulkOps.length });
  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json(
      { success: false, message: "Cron job failed." },
      { status: 500 },
    );
  }
}
