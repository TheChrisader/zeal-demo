import { fetcher } from "@/lib/fetcher";

import { IPost } from "@/types/post.type";
import { jsonToFormData } from "@/utils/converter.utils";

export const createPost = async (
  post: Partial<IPost> & { image?: File | string },
): Promise<IPost> => {
  try {
    if (!post.title || !post.content || !post.description || !post.category) {
      throw new Error("Missing required fields");
    }
    const formData = jsonToFormData(post);

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

export const fetchPostsByAuthorId = async (
  authorId: string,
  page: number = 1,
): Promise<IPost[]> => {
  try {
    const data = await fetcher(`/api/v1/post/author/${authorId}?page=${page}`, {
      method: "GET",
    });
    return data;
  } catch (error) {
    // throw error;
    return [];
  }
};

export const fetchPostById = async (postId: string): Promise<IPost | null> => {
  try {
    const data = await fetcher(`/api/v1/post/${postId}`, {
      method: "GET",
    });
    return data;
  } catch (error) {
    // throw error;
    return null;
  }
};

export const updatePostById = async (
  postId: string,
  post: Partial<IPost> & { image?: File | string },
): Promise<IPost | null> => {
  try {
    const formData = jsonToFormData(post);

    if (post.image) {
      formData.append("image", post.image);
    }

    const data = await fetcher(`/api/v1/post/${postId}`, {
      method: "PATCH",
      body: formData,
    });

    return data;
  } catch (error) {
    // throw error;
    return null;
  }
};

export const deletePostById = async (postId: string): Promise<IPost | null> => {
  try {
    const data = await fetcher(`/api/v1/post/${postId}`, {
      method: "DELETE",
    });
    return data;
  } catch (error) {
    // throw error;
    return null;
  }
};
