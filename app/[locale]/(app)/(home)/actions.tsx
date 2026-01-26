"use server";

import { getTopLevelCategoryList, TopLevelCategory } from "@/categories";
import PostModel from "@/database/post/post.model";

const LOAD_MORE_LIMIT = 5;
const INITIAL_HEADLINES_LIMIT = 13;

export async function loadMoreHeadlines(offset: number, category: string) {
  const headlinesPosts = await PostModel.find({
    category: {
      $in: [...getTopLevelCategoryList(category as TopLevelCategory)],
    },
    image_url: {
      $ne: null,
    },
  })
    .sort({
      published_at: -1,
    })
    .skip(offset * LOAD_MORE_LIMIT + INITIAL_HEADLINES_LIMIT)
    .limit(LOAD_MORE_LIMIT)
    .exec();

  return JSON.parse(JSON.stringify(headlinesPosts));
}
