import { Id } from "@/lib/database";

import { IDraft } from "@/types/draft.type";
import DraftModel from "./draft.model";

export const createInitialDraft = async (userId: string | Id) => {
  try {
    return await DraftModel.create({
      user_id: userId,
      title: "Untitled Document",
    });
  } catch (error) {
    throw error;
  }
};

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
    const draft = await DraftModel.findById(id);
    return draft?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

export const getDraftsByUserId = async (
  userId: string | Id,
  status?: IDraft["moderationStatus"],
): Promise<IDraft[]> => {
  try {
    const query: { user_id: string | Id; status?: IDraft["moderationStatus"] } =
      { user_id: userId };
    if (status) {
      query.status = status;
    }

    const drafts = await DraftModel.find(query)
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

export const getDraftsByStatus = async (
  status: IDraft["moderationStatus"],
): Promise<IDraft[]> => {
  try {
    const drafts = await DraftModel.find({ status }).sort({ created_at: -1 });
    return drafts.map((draft) => draft.toObject());
  } catch (error) {
    throw error;
  }
};
