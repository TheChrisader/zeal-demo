import { NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import { createReactions } from "@/database/reaction/reaction.repository";
import { connectToDatabase } from "@/lib/database";
import { isMongooseDuplicateKeyError } from "@/utils/mongoose.utils";

export const POST = async () => {
  try {
    await connectToDatabase();

    const todaysPosts = await PostModel.find({
      created_at: {
        $gte: new Date(new Date().setHours(new Date().getHours() - 12)),
        $lt: new Date(),
      },
    });

    const postIDs = todaysPosts.map((post) => ({ post_id: post._id }));

    try {
      await createReactions(postIDs);
    } catch (error) {
      if (!isMongooseDuplicateKeyError(error)) {
        throw error;
      }
    }

    return NextResponse.json({
      message: "Reactions generated",
      posts: postIDs.length,
    });
  } catch (error) {
    NextResponse.json({ message: error });
  }
};
