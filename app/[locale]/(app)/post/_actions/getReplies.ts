"use server";
import CommentModel from "@/database/comment/comment.model";
import { CommentUser } from "@/database/comment/comment.repository";
import UserModel from "@/database/user/user.model";
import { connectToDatabase } from "@/lib/database";

export async function getReplies(commentId: string, depth: number) {
  await connectToDatabase();
  return await CommentModel.find({ parent_id: commentId, depth })
    .populate<{
      user_id: CommentUser;
    }>("user_id", "username display_name avatar", UserModel)
    .lean();
}
