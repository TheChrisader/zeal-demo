import { fetcher } from "@/lib/fetcher";

import { IDraft } from "@/types/draft.type";
import { jsonToFormData } from "@/utils/converter.utils";

export const getDraftsByUserId = async () => {
  try {
    const drafts = await fetcher(`/api/v1/draft`);
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
