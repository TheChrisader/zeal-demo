import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import PostModel from "@/database/post/post.model";
import isEnglish from "is-english";

export const POST = async () => {
  try {
    await connectToDatabase();

    const todaysPosts = await PostModel.find();

    const nonEnglishPosts = todaysPosts.filter((post) => {
      const currentPost = post.toObject();
      if (!isEnglish(currentPost.title)) {
        console.log(currentPost.title);
        return true;
      }
    });

    return NextResponse.json(nonEnglishPosts.length);
  } catch (error) {
    NextResponse.json({ message: error });
  }
};
