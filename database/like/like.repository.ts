import { Id } from "@/lib/database";

import { ILike } from "@/types/like.type";
import LikeModel from "./like.model";

// create like
export const createLike = async (
  user_id: string | Id,
  article_id: string | Id,
): Promise<ILike> => {
  try {
    return await LikeModel.create({
      user_id,
      article_id,
    });
  } catch (error) {
    throw error;
  }
};

export const getLikeByUserAndPostID = async (
  userId: string | Id,
  articleId: string | Id,
): Promise<ILike | null> => {
  try {
    const like = await LikeModel.findOne({
      user_id: userId,
      article_id: articleId,
    });
    return like?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

// get all likes by user id
export const getLikesByUserId = async (
  userId: string | Id,
): Promise<ILike[]> => {
  try {
    const likes = await LikeModel.find({ user_id: userId })
      .sort({
        created_at: -1,
      })
      .limit(15);
    return likes.map((like) => like.toObject());
  } catch (error) {
    throw error;
  }
};

export const checkLike = async (
  userId: string | Id,
  articleId: string | Id,
) => {
  try {
    const like = await LikeModel.findOne({
      user_id: userId,
      article_id: articleId,
    });
    return !!like;
  } catch (error) {
    throw error;
  }
};

// delete like by user id
export const deleteLikeByUserId = async (
  userId: string | Id,
  articleId: string | Id,
): Promise<ILike | null> => {
  try {
    const deletedLikeDoc = await LikeModel.findOneAndDelete({
      user_id: userId,
      article_id: articleId,
    });
    return deletedLikeDoc?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

// delete multiple likes by user id
export const deleteLikesByUserId = async (
  userId: string | Id,
): Promise<number> => {
  try {
    const { deletedCount } = await LikeModel.deleteMany({
      user_id: userId,
    });
    return deletedCount;
  } catch (error) {
    throw error;
  }
};
