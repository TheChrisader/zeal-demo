import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import PostModel from "@/database/post/post.model";
import { createReactions } from "@/database/reaction/reaction.repository";

export const POST = async () => {
  try {
    await connectToDatabase();

    const todaysPosts = await PostModel.find({
      created_at: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    }).sort({ created_at: -1 });

    const postIDs = todaysPosts.map((post) => ({ post_id: post._id }));

    try {
      await createReactions(postIDs);
    } catch (error) {
      // @ts-expect-error TODO
      if (error.code !== 11000) {
        throw error;
      }
    }

    return NextResponse.json({ message: "Reactions generated" });
  } catch (error) {
    NextResponse.json({ message: error });
  }
};
