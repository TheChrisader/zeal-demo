import PostModel from "@/database/post/post.model";
import { fetcher } from "@/lib/fetcher";

import { IPost } from "@/types/post.type";

export const createPost = async (post: {
  title: string;
  content: string;
  category: string;
  image?: File;
}): Promise<IPost> => {
  try {
    const formData = new FormData();
    formData.append("title", post.title);
    formData.append("content", post.content);
    formData.append("category", post.category);

    if (post.image) {
      formData.append("image", post.image);
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
