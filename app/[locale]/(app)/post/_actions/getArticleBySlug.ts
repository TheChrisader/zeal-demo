"use server";

import PostModel from "@/database/post/post.model";
import { IPost } from "@/types/post.type";

export async function getArticleBySlug(slug: string): Promise<IPost | null> {
  if (!slug) return null;
  return (await PostModel.findOne({ slug }))?.toObject() || null;
}
