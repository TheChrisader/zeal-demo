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
  settings: { published: boolean; type: "writer" | "freelance_writer" } = {
    published: false,
    type: "writer",
  },
) => {
  if (settings.published) {
    return await updatePostById(id, data);
    // if (settings.type === "writer") {
    // } else {
    //   return await pushDraftForApproval(id);
    // }
  } else {
    // (data as IDraft).moderationStatus = "draft";
    return await updateDraft(id, data);
  }
};
