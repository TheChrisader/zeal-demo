import { fetcher } from "@/lib/fetcher";

import { IDraft } from "@/types/draft.type";
import { jsonToFormData } from "@/utils/converter.utils";

export const createInitialDraft = async () => {
  try {
    const formData = new FormData();
    formData.append('title', 'Untitled Document');
    
    const newDraft = await fetcher(`/api/v1/draft`, {
      method: "POST",
      body: formData,
    });
    return newDraft;
  } catch (error) {
    throw error;
  }
};

export const getDraftsByUserId = async (page: number = 1) => {
  try {
    const drafts = await fetcher(`/api/v1/draft?page=${page}`);
    return drafts;
  } catch (error) {
    // throw error;
    return [];
  }
};

export const getDraftData = async (id: string) => {
  try {
    const draft = await fetcher(`/api/v1/draft/${id}`);
    return draft;
  } catch (error) {
    // throw error;
    return null;
  }
};

export const createDraft = async (
  draft: Partial<IDraft> & { image?: File | string },
) => {
  try {
    if (!draft.title) {
      throw new Error("Title is required");
    }

    const formData = jsonToFormData(draft);

    if (draft.image) {
      formData.append("image", draft.image);
    }

    const newDraft = await fetcher(`/api/v1/draft`, {
      method: "POST",
      body: formData,
    });

    return newDraft;
  } catch (error) {
    throw error;
  }
};

export const updateDraft = async (
  id: string,
  draft: Partial<IDraft> & { image?: File | string },
) => {
  try {
    const formData = jsonToFormData(draft);

    if (draft.image) {
      formData.append("image", draft.image);
    }

    const updatedDraft = await fetcher(`/api/v1/draft/${id}`, {
      method: "PATCH",
      body: formData,
    });
    return updatedDraft;
  } catch (error) {
    throw error;
  }
};

export const deleteDraftById = async (id: string) => {
  try {
    const deletedDraft = await fetcher(`/api/v1/draft/${id}`, {
      method: "DELETE",
    });
    return deletedDraft;
  } catch (error) {
    throw error;
  }
};

export const getDraftsAwaitingApproval = async () => {
  try {
    const drafts = await fetcher(`/api/v1/draft/awaiting-approval`);
    return drafts;
  } catch (error) {
    throw error;
  }
};

export const pushDraftForApproval = async (id: string) => {
  try {
    const pushedDraft = await fetcher(`/api/v1/draft/${id}/push`, {
      method: "PATCH",
    });
    return pushedDraft;
  } catch (error) {
    throw error;
  }
};

export const searchDrafts = async (searchQuery: string, page: number = 1): Promise<IDraft[]> => {
  try {
    const drafts = await fetcher(`/api/v1/draft/search?q=${encodeURIComponent(searchQuery)}&page=${page}`);
    return drafts;
  } catch (error) {
    console.error("Failed to search drafts:", error);
    return [];
  }
};

export const batchDeleteDrafts = async (draftIds: string[]): Promise<{ deletedCount: number }> => {
  try {
    const result = await fetcher(`/api/v1/draft/batch-delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ draftIds }),
    });
    return result;
  } catch (error) {
    console.error("Failed to batch delete drafts:", error);
    throw error;
  }
};
