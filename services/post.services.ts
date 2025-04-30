import { fetcher } from "@/lib/fetcher";

import { IPost } from "@/types/post.type";
import { createDraft } from "./draft.services";

export const createPost = async (post: {
  title: string;
  content: string;
  description: string; // Add description
  category: string;
  image?: File | string;
}): Promise<IPost> => {
  try {
    await createDraft({
      title: post.title,
      content: post.content,
      description: post.description, // Add description
      category: post.category,
      image: post.image,
    });
    console.log("filee", post.image);

    const formData = new FormData();
    formData.append("title", post.title);
    formData.append("content", post.content);
    formData.append("description", post.description); // Append description
    formData.append("category", post.category);

    if (post.image) {
      formData.append("image", post.image);
      console.log("fileeeeeeee", formData.get("image"));
    }

    const data = await fetcher("/api/v1/post", {
      method: "POST",
      body: formData,
    });

    return data;
  } catch (error) {
    throw error;
  }
};
