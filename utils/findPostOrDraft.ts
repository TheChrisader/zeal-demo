import { Types } from "mongoose";
import { getDraftById } from "@/database/draft/draft.repository";
import { getPostById } from "@/database/post/post.repository";
import { connectToDatabase, newId } from "@/lib/database";

export async function findPostOrDraftById(_id: string) {
  try {
    await connectToDatabase();
    const id = newId(_id);

    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const [post, draft] = await Promise.all([
      getPostById(id),
      getDraftById(id),
    ]);

    if (post) return post;
    if (draft) return draft;

    return null;
  } catch (error) {
    console.error("Error searching for document:", error);
    throw error;
  }
}
