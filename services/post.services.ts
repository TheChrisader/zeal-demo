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

export const searchPosts = async (searchQuery: string, authorId: string, page: number = 1): Promise<IPost[]> => {
  try {
    const posts = await fetcher(`/api/v1/post/search?q=${encodeURIComponent(searchQuery)}&authorId=${authorId}&page=${page}`);
    return posts;
  } catch (error) {
    console.error("Failed to search posts:", error);
    return [];
  }
};

export const batchDeletePosts = async (postIds: string[]): Promise<{ deletedCount: number }> => {
  try {
    const result = await fetcher(`/api/v1/post/batch-delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postIds }),
    });
    return result;
  } catch (error) {
    console.error("Failed to batch delete posts:", error);
    throw error;
  }
};
