import { Id } from "@/lib/database";

import { IDislike } from "@/types/dislike.type";
import DislikeModel from "./dislike.model";

// create dislike
export const createDislike = async (
  user_id: string | Id,
  article_id: string | Id,
): Promise<IDislike> => {
  try {
    return await DislikeModel.create({
      user_id,
      article_id,
    });
  } catch (error) {
    throw error;
  }
};

export const getDislikeByUserAndPostID = async (
  userId: string | Id,
  articleId: string | Id,
): Promise<IDislike | null> => {
  try {
    const dislike = await DislikeModel.findOne({
      user_id: userId,
      article_id: articleId,
    });
    return dislike?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

// get all dislikes by user id
export const getDislikesByUserId = async (
  userId: string | Id,
): Promise<IDislike[]> => {
  try {
    const dislikes = await DislikeModel.find({ user_id: userId })
      .sort({
        created_at: -1,
      })
      .limit(15);
    return dislikes.map((dislike) => dislike.toObject());
  } catch (error) {
    throw error;
  }
};

export const checkDislike = async (
  userId: string | Id,
  articleId: string | Id,
) => {
  try {
    const dislike = await DislikeModel.findOne({
      user_id: userId,
      article_id: articleId,
    });
    return !!dislike;
  } catch (error) {
    throw error;
  }
};

// delete dislike by user id
export const deleteDislikeByUserId = async (
  userId: string | Id,
  articleId: string | Id,
): Promise<IDislike | null> => {
  try {
    const deletedDislikeDoc = await DislikeModel.findOneAndDelete({
      user_id: userId,
      article_id: articleId,
    });
    return deletedDislikeDoc?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

// delete multiple dislikes by user id
export const deleteDislikesByUserId = async (
  userId: string | Id,
): Promise<number> => {
  try {
    const { deletedCount } = await DislikeModel.deleteMany({
      user_id: userId,
    });
    return deletedCount;
  } catch (error) {
    throw error;
  }
};
