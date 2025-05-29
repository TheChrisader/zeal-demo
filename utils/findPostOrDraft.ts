import DraftModel from "@/database/draft/draft.model";
import { getDraftById } from "@/database/draft/draft.repository";
import PostModel from "@/database/post/post.model";
import { getPostById } from "@/database/post/post.repository";
import { connectToDatabase, Id, newId } from "@/lib/database";
import { Types } from "mongoose";

export async function findPostOrDraftById(_id: string) {
  try {
    await connectToDatabase();
    const id = newId(_id);
    console.log("type shAft");

    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    console.log("object");

    const [post, draft] = await Promise.all([
      getPostById(id),
      getDraftById(id),
    ]);

    console.log(post, draft, "!!!!!!!!!!!!!!!!!!!!!!!1");

    if (post) return post;
    if (draft) return draft;

    return null;
  } catch (error) {
    console.error("Error searching for document:", error);
    throw error;
  }
}
