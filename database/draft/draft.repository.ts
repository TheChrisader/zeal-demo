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

interface DraftQueryOptions {
  limit?: number;
  skip?: number;
}

export const getDraftsByUserId = async (
  userId: string | Id,
  options: DraftQueryOptions = {},
  status?: IDraft["moderationStatus"],
): Promise<IDraft[]> => {
  try {
    const query: {
      user_id: string | Id;
      moderationStatus?: IDraft["moderationStatus"];
    } = { user_id: userId };
    if (status) {
      query.moderationStatus = status;
    }

    const skip = options.skip || 0;
    const limit = options.limit || 5;

    const drafts = await DraftModel.find(query)
      .sort({
        created_at: -1,
      })
      .skip(skip)
      .limit(limit)
      .select("_id id title description moderationStatus updated_at");
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
    const drafts = await DraftModel.find({ moderationStatus: status }).sort({
      created_at: -1,
    });
    return drafts.map((draft) => draft.toObject());
  } catch (error) {
    throw error;
  }
};

export const updateManyDrafts = async (
  ids: string[],
  update: Partial<IDraft>,
): Promise<number> => {
  try {
    const { modifiedCount } = await DraftModel.updateMany(
      { _id: { $in: ids } },
      { $set: update },
    );
    return modifiedCount;
  } catch (error) {
    throw error;
  }
};

export const deleteManyDrafts = async (ids: string[]): Promise<number> => {
  try {
    const { deletedCount } = await DraftModel.deleteMany({ _id: { $in: ids } });
    return deletedCount;
  } catch (error) {
    throw error;
  }
};

export interface DraftFilterParams {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  category?: string;
  fromDate?: string;
  toDate?: string;
  author?: string;
}

interface DraftQuery {
  $or?: Array<{ [key: string]: { $regex: string; $options: "i" } }>;
  category?: { $in: string[] };
  user_id?: string | Id;
  created_at?: { $gte?: Date; $lte?: Date };
  moderationStatus?: IDraft["moderationStatus"];
}

export const getDraftsByFilters = async (
  filters: DraftFilterParams,
): Promise<IDraft[]> => {
  const query: DraftQuery = { moderationStatus: "awaiting_approval" };

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters.category) {
    query.category = { $in: filters.category.split(",") };
  }

  if (filters.author) {
    query.user_id = filters.author;
  }

  if (filters.fromDate || filters.toDate) {
    query.created_at = {};
    if (filters.fromDate) {
      query.created_at.$gte = new Date(filters.fromDate);
    }
    if (filters.toDate) {
      query.created_at.$lte = new Date(filters.toDate);
    }
  }

  try {
    const drafts = await DraftModel.find(query)
      .sort({
        [filters.sort || "created_at"]: filters.order === "asc" ? 1 : -1,
      })
      .skip((filters.page - 1) * filters.limit || 0)
      .limit(filters.limit || 10);
    return drafts.map((draft) => draft.toObject());
  } catch (error) {
    throw error;
  }
};
