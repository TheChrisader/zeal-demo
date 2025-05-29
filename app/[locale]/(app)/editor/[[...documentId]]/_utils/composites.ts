import { fetcher } from "@/lib/fetcher";
import { updateDraft } from "@/services/draft.services";
import { updatePostById } from "@/services/post.services";
import { IDraft } from "@/types/draft.type";
import { IPost } from "@/types/post.type";

export const fetchById = async (id: string) => {
  try {
    const data = await fetcher(`/api/v1/editor/${id}`, {
      method: "GET",
    });
    return data;
  } catch (error) {
    return null;
  }
};

export const updateById = async (
  id: string,
  data: Partial<IPost | IDraft> & { image?: File },
  published: boolean,
) => {
  if (published) {
    return await updatePostById(id, data);
  } else {
    return await updateDraft(id, data);
  }
};
