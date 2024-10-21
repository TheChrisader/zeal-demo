import { Id } from "@/lib/database";

import { IPost } from "@/types/post.type";

import PostModel from "./post.model";

export type SortParams<D> = Partial<Record<keyof D, -1 | 1>>;

export type QueryOptions<D> = {
  sort?: SortParams<D>;
  skip?: number;
  limit?: number;
};

// create post
export const createPost = async (post: Partial<IPost>): Promise<IPost> => {
  try {
    const newPostDoc = await PostModel.create(post);
    const createdPost = newPostDoc.toObject();
    return createdPost;
  } catch (error) {
    throw error;
  }
};

// update post
export const updatePost = async (post: IPost): Promise<IPost | null> => {
  try {
    const updatedPostDoc = await PostModel.findByIdAndUpdate(
      post.id,
      { $set: { ...post } },
      {
        new: true,
      },
    );
    const updatedPost = updatedPostDoc?.toObject() || null;
    return updatedPost;
  } catch (error) {
    throw error;
  }
};

// get post
export const getPostById = async (
  postId: string | Id,
): Promise<IPost | null> => {
  try {
    const postDoc = await PostModel.findById(postId);
    const post = postDoc?.toObject() || null;
    return post;
  } catch (error) {
    throw error;
  }
};

// delete post
export const deletePostById = async (
  postId: string | Id,
): Promise<IPost | null> => {
  try {
    const deletedPostDoc = await PostModel.findByIdAndDelete(postId);
    const deletedPost = deletedPostDoc?.toObject() || null;
    return deletedPost;
  } catch (error) {
    throw error;
  }
};

// create posts
export const createPosts = async (
  posts: Partial<IPost>[],
): Promise<IPost[]> => {
  try {
    const createdPosts = await PostModel.insertMany(posts, {
      ordered: false,
    });
    return createdPosts.map((post) => post.toObject());
  } catch (error) {
    throw error;
  }
};

// get posts
export const getPosts = async (): Promise<IPost[]> => {
  try {
    const posts = await PostModel.find();
    return posts.map((post) => post.toObject());
  } catch (error) {
    throw error;
  }
};

// get many posts
export const getPostsByIds = async (
  postIds: string[],
  sort?: SortParams<IPost>,
): Promise<IPost[]> => {
  try {
    if (!sort) {
      sort = {
        published_at: -1,
      };
    }
    const posts = await PostModel.find({ _id: { $in: postIds } }).sort({
      ...sort,
    });
    return posts.map((post) => post.toObject());
  } catch (error) {
    throw error;
  }
};

// get many posts by filters
/* {filters.query
    ? {
        $or: [
          { title: { $regex: filters.query, $options: "i" } },
          { description: { $regex: filters.query, $options: "i" } },
        ],
      }
    : {},
  filters.categories
    ? { category: { $in: filters.categories } }
    : {},
  filters.authors
    ? { author_id: { $in: filters.authors } }
    : {},} */
export const getPostsByFilters = async (filters: {
  query?: string;
  categories?: string[];
  domain?: string;
  keywords?: string[];
  country?: string[];
  image?: boolean;
  limit?: number;
  cluster?: string;
  skip?: number;
  sort?: SortParams<IPost>;
}): Promise<IPost[]> => {
  const queryFilters = filters.query
    ? {
        $or: [
          { title: { $regex: filters.query.trim(), $options: "i" } },
          { description: { $regex: filters.query, $options: "i" } },
        ],
      }
    : {};

  let categoriesFilters = filters.categories
    ? { category: { $in: filters.categories } }
    : {};

  const domainFilters = filters.domain?.length
    ? { "source.name": filters.domain }
    : {};

  const keywordsFilters = filters.keywords
    ? { keywords: { $in: filters.keywords } }
    : {};

  const countryFilters = filters.country
    ? { country: { $in: filters.country } }
    : {};

  const imageFilters = !filters.image ? {} : { image_url: { $ne: null } };

  const clusterFilters = filters.cluster ? { cluster_id: filters.cluster } : {};

  if (filters.query) {
    categoriesFilters = {};
  }

  // console.log({
  //   ...queryFilters,
  //   ...categoriesFilters,
  //   ...domainFilters,
  //   ...keywordsFilters,
  //   ...countryFilters,
  //   ...imageFilters,
  //   ...clusterFilters,
  // });

  try {
    const posts = await PostModel.find({
      ...queryFilters,
      ...categoriesFilters,
      ...domainFilters,
      ...keywordsFilters,
      ...countryFilters,
      ...imageFilters,
      ...clusterFilters,
    })
      .skip(filters.skip || 0)
      .limit(filters.limit || 20)
      .sort(
        filters.sort || {
          published_at: -1,
        },
      );
    return posts.map((post) => post.toObject());
  } catch (error) {
    throw error;
  }
};

export const getPostsByCategories = async (
  categories: string[],
): Promise<IPost[]> => {
  try {
    const posts = await PostModel.find({ category: { $in: categories } });
    return posts.map((post) => post.toObject());
  } catch (error) {
    throw error;
  }
};

export const getPostsByAuthorId = async (
  authorId: string | Id,
): Promise<IPost[]> => {
  try {
    const posts = await PostModel.find({ author_id: authorId });
    return posts.map((post) => post.toObject());
  } catch (error) {
    throw error;
  }
};

export const getPostsByKeyword = async (keyword: string): Promise<IPost[]> => {
  try {
    const posts = await PostModel.find({
      title: { $regex: keyword, $options: "i" },
    });
    return posts.map((post) => post.toObject());
  } catch (error) {
    throw error;
  }
};
