import { NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import { connectToDatabase } from "@/lib/database";

export const POST = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    // Calculate the date 30 minutes ago
    const thirtyMinutesAgo = new Date(Date.now() - 35 * 60 * 1000);

    // Find and update all posts created in the last 30 minutes with keyword: null
    const result = await PostModel.updateMany(
      {
        created_at: { $gte: thirtyMinutesAgo },
        keywords: null,
      },
      {
        $set: { keywords: [] },
      },
    );

    console.log(`Successfully updated ${result.modifiedCount} documents.`);

    console.log("Content update process completed");
    return NextResponse.json({
      message: `Successfully updated ${result.modifiedCount} posts`,
    });
  } catch (error) {
    console.error("Error updating posts:", error);
    return NextResponse.json(
      { message: "Error updating posts" },
      { status: 500 },
    );
  }
};
