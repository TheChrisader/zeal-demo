import { Id } from "@/lib/database";

import { IDraft } from "@/types/draft.type";
import DraftModel from "./draft.model";

export const createDraft = async (draft: Partial<IDraft>) => {
  try {
    return await DraftModel.create({
      ...draft,
    });
  } catch (error) {
    throw error;
  }
};

export const getDraftById = async (id: string | Id): Promise<IDraft | null> => {
  try {
    const draft = await DraftModel.findOne({ _id: id });
    return draft?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

export const getDraftsByUserId = async (
  userId: string | Id,
): Promise<IDraft[]> => {
  try {
    const drafts = await DraftModel.find({ user_id: userId })
      .sort({
        created_at: -1,
      })
      .limit(15);
    return drafts.map((draft) => draft.toObject());
  } catch (error) {
    throw error;
  }
};

export const deleteDraftById = async (
  id: string | Id,
): Promise<IDraft | null> => {
  try {
    const deletedDraftDoc = await DraftModel.findOneAndDelete({ _id: id });
    return deletedDraftDoc?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

export const deleteMultipleDraftsByUserId = async (
  userId: string | Id,
): Promise<number> => {
  try {
    const { deletedCount } = await DraftModel.deleteMany({
      user_id: userId,
    });
    return deletedCount;
  } catch (error) {
    throw error;
  }
};

export const updateDraft = async (
  id: string | Id,
  draft: Partial<IDraft>,
): Promise<IDraft | null> => {
  try {
    const updatedDraftDoc = await DraftModel.findOneAndUpdate(
      { _id: id },
      { ...draft },
      { new: true },
    );
    return updatedDraftDoc?.toObject() || null;
  } catch (error) {
    throw error;
  }
};
