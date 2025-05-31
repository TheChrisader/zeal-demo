import { NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import { connectToDatabase } from "@/lib/database";

export const POST = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    const posts = await PostModel.find({
      generatedBy: "user",
    });

    // Process each post
    for (const post of posts) {
      if (post.content && typeof post.content === "string") {
        // Create a regex with the exact substring (case-sensitive)
        const regex = new RegExp("d3h4b588jh7zgi", "g");

        // Perform replacement only if substring exists
        if (regex.test(post.content)) {
          const newContent = post.content.replace(regex, "d3hovs1ug0rvor");

          // Update only if content actually changed
          if (newContent !== post.content) {
            post.content = newContent;
            await post.save();
            console.log(`Updated content for post: ${post._id}`);
          }
        }
      }
    }

    console.log("Content update process completed");
    return NextResponse.json({
      message: `Successfully updated ${posts.length} posts`,
    });
  } catch (error) {
    console.error("Error updating posts:", error);
    return NextResponse.json(
      { message: "Error updating posts" },
      { status: 500 },
    );
  }
};
