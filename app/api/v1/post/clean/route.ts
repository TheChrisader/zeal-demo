import { NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import { connectToDatabase } from "@/lib/database";
import { stripExtraWhitespace } from "@/utils/string.utils";

export const POST = async () => {
  try {
    // await connectToDatabase();

    // const posts = await PostModel.find({});

    // for (const post of posts) {
    //   post.content = stripExtraWhitespace(post.content);
    //   await post.save();
    // }

    return NextResponse.json(`All posts cleaned`);
  } catch (error) {
    return NextResponse.json({ message: error });
  }
};
