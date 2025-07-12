import { NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import { connectToDatabase } from "@/lib/database";
import { slugs } from "./slugs";

export const POST = async () => {
  const processed: Record<string, boolean> = {};
  try {
    // Connect to MongoDB
    await connectToDatabase();
    let result = 0;

    for (const slug of slugs) {
      if (processed[slug.slug]) {
        await PostModel.updateOne(
          { slug: slug.slug },
          {
            $addToSet: {
              category: slug.field,
            },
          },
        );
        result++;
      } else {
        await PostModel.updateOne(
          { slug: slug.slug },
          {
            $set: {
              category: [slug.field],
            },
          },
        );
        processed[slug.slug] = true;
        result++;
      }
    }

    console.log(`Successfully updated ${result} documents.`);

    console.log("Content update process completed");
    return NextResponse.json({
      message: `Successfully updated ${result} posts`,
    });
  } catch (error) {
    console.error("Error updating posts:", error);
    return NextResponse.json(
      { message: "Error updating posts" },
      { status: 500 },
    );
  }
};
