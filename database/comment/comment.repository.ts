import { connectToDatabase, Id } from "@/lib/database";

import { IComment } from "@/types/comment.type";
import CommentModel from "./comment.model";
import UserModel from "../user/user.model";

export interface CommentUser {
  _id: string;
  display_name: string;
  username: string;
  avatar: string;
}

export interface ICommentResponse
  extends Omit<IComment, "user_id" | "created_at"> {
  user_id: CommentUser;
  created_at: Date | string;
}

// create comment
export const createComment = async (
  commentToCreate: Partial<IComment>,
): Promise<
  IComment & {
    _id: Id;
  } & Required<{
      _id: Id;
    }>
> => {
  try {
    const createdCommentDoc = await CommentModel.create(commentToCreate);
    const populatedComment = await createdCommentDoc.populate<{
      user_id: CommentUser;
    }>("user_id", "username display_name avatar");
    const createdComment = populatedComment.toObject();
    return createdComment;
  } catch (error) {
    throw error;
  }
};

export const getCommentById = async (
  commentId: string | Id,
): Promise<IComment | null> =>
  await CommentModel.findOne({ _id: commentId }).lean();

// get comments by article id
interface QueryParams {
  parent_id?: string;
  page?: number;
  limit?: number;
  skip?: number;
}
export const getCommentsByArticleId = async (
  articleId: string | Id,
  { parent_id = undefined, page = 1, limit = 10 }: Omit<QueryParams, "skip">,
) => {
  try {
    await connectToDatabase();
    if (page < 1) page = 1;
    const skip: QueryParams["skip"] = (page - 1) * limit;

    const query = {
      article_id: articleId,
      parent_id: parent_id || null,
      is_deleted: false,
    };

    const [comments, total] = await Promise.all([
      CommentModel.find(query)
        .sort({ created_at: -1 })
        .skip(skip!)
        .limit(limit!)
        .populate<{
          user_id: CommentUser;
        }>("user_id", "username display_name avatar", UserModel)
        .lean(),
      CommentModel.countDocuments(query),
    ]);

    return {
      comments,
      pagination: { total, pages: Math.ceil(total / limit!), current: page },
    };
  } catch (error) {
    throw error;
  }
};

// get comments by user id
export const getCommentsByUserId = async (
  userId: string | Id,
): Promise<IComment[]> => {
  try {
    const comments = await CommentModel.find({ user_id: userId });
    return comments.map((comment) => comment.toObject());
  } catch (error) {
    throw error;
  }
};

// update comment
export const updateComment = async (
  commentId: string | Id,
  commentToUpdate: Partial<IComment>,
): Promise<IComment | null> => {
  try {
    const updatedCommentDoc = await CommentModel.findOneAndUpdate(
      { _id: commentId },
      { $set: { ...commentToUpdate } },
      { new: true },
    );
    return updatedCommentDoc?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

export const updateReplyCount = async (
  commentId: string | Id,
  replyCount: number,
) =>
  CommentModel.findOneAndUpdate(
    { _id: commentId },
    { $inc: { reply_count: replyCount } },
    { new: true },
  );

// delete comment by id
export const deleteCommentById = async (
  commentId: string | Id,
): Promise<IComment | null> => {
  try {
    const deletedCommentDoc = await CommentModel.findOneAndDelete({
      _id: commentId,
    });
    return deletedCommentDoc?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

// delete comments by article id
export const deleteCommentsByArticleId = async (
  articleId: string | Id,
): Promise<number> => {
  try {
    const { deletedCount } = await CommentModel.deleteMany({
      article_id: articleId,
    });
    return deletedCount;
  } catch (error) {
    throw error;
  }
};
