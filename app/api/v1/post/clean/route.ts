import isEnglish from "is-english";
import { NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import { connectToDatabase } from "@/lib/database";

function removeCharacters(str: string, charsToRemove: string[]) {
  const regex = new RegExp(`[${charsToRemove.join("")}]`, "g");
  return str.replace(regex, "");
}

export const POST = async () => {
  try {
    await connectToDatabase();

    const todaysPosts = await PostModel.find({
      created_at: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });

    const nonEnglishPosts = todaysPosts.filter((post) => {
      const currentPost = post.toObject();
      if (
        !isEnglish(
          removeCharacters(currentPost.title, [
            "‘",
            "’",
            "…",
            "₦",
            "—",
            "™",
            "“",
            "”",
            "|",
          ]),
        )
      ) {
        return true;
      }
    });

    // get IDs
    const postIDs = nonEnglishPosts.map((post) => post._id);

    await PostModel.deleteMany({ _id: { $in: postIDs } });

    return NextResponse.json(nonEnglishPosts.length);
  } catch (error) {
    NextResponse.json({ message: error });
  }
};
