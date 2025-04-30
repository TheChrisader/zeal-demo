import { fetcher } from "@/lib/fetcher";

import { IDraft } from "@/types/draft.type";

export const getDraftsByUserId = async () => {
  try {
    const drafts = await fetcher(`/api/v1/draft`);
    return drafts;
  } catch (error) {
    throw error;
  }
};

export const getDraftData = async (id: string) => {
  try {
    const draft = await fetcher(`/api/v1/draft/${id}`);
    return draft;
  } catch (error) {
    throw error;
  }
};

export const createDraft = async (draft: {
  title: string;
  content: string;
  description: string; // Add description
  category: string;
  image?: File | string;
}) => {
  try {
    const formData = new FormData();
    formData.append("title", draft.title);
    formData.append("content", draft.content);
    formData.append("description", draft.description); // Append description
    formData.append("category", draft.category);

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
  draft: {
    title: string;
    content: string;
    description: string;
    category: string;
    image?: File | string;
  },
) => {
  try {
    const formData = new FormData();
    formData.append("title", draft.title);
    formData.append("content", draft.content);
    formData.append("description", draft.description);
    formData.append("category", draft.category);

    if (draft.image) {
      formData.append("image", draft.image);
    }

    const updatedDraft = await fetcher(`/api/v1/draft/${id}`, {
      method: "PUT",
      body: formData,
    });
    return updatedDraft;
  } catch (error) {
    throw error;
  }
};
