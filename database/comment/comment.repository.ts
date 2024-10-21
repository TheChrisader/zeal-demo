import { Id } from "@/lib/database";

import { IComment } from "@/types/comment.type";
import CommentModel from "./comment.model";

// create comment
export const createComment = async (
  commentToCreate: IComment,
): Promise<IComment> => {
  try {
    const createdCommentDoc = await CommentModel.create(commentToCreate);
    const createdComment: IComment = createdCommentDoc.toObject();
    return createdComment;
  } catch (error) {
    throw error;
  }
};

// get comments by article id
export const getCommentsByArticleId = async (
  articleId: string | Id,
): Promise<IComment[]> => {
  try {
    const comments = await CommentModel.find({ article_id: articleId });
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
