import { Id } from "@/lib/database";
import { IReaction } from "@/types/reaction.type";
import ReactionModel from "./reaction.model";

export const createReaction = async (
  reaction: IReaction,
): Promise<IReaction | null> => {
  try {
    const newReaction = await ReactionModel.create(reaction);
    return newReaction.toObject();
  } catch (error) {
    throw error;
  }
};

export const updateReaction = async (
  reaction: IReaction,
): Promise<IReaction | null> => {
  try {
    const updatedReaction = await ReactionModel.findOneAndUpdate(
      { _id: reaction.id },
      reaction,
      { new: true },
    );
    return updatedReaction?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

// get reacton by article id
export const getReactionByPostId = async (
  postId: string | Id,
): Promise<IReaction | null> => {
  try {
    const reaction = await ReactionModel.findOne({ post_id: postId });
    return reaction?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

// delete reaction by article id
export const deleteReactionByPostId = async (
  postId: string | Id,
): Promise<IReaction | null> => {
  try {
    const deletedReaction = await ReactionModel.findOneAndDelete({
      post_id: postId,
    });
    return deletedReaction?.toObject() || null;
  } catch (error) {
    throw error;
  }
};
