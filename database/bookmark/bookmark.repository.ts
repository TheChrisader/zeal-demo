import { Id } from "@/lib/database";

import { IBookmark } from "@/types/bookmark.type";
import BookmarkModel from "./bookmark.model";

// create bookmark
export const createBookmark = async (
  user_id: string | Id,
  article_id: string | Id,
): Promise<IBookmark> => {
  try {
    return await BookmarkModel.create({
      user_id,
      article_id,
    });
  } catch (error) {
    throw error;
  }
};

// get all bookmarks by user id
export const getBookmarksByUserId = async (
  userId: string | Id,
): Promise<IBookmark[]> => {
  try {
    const bookmarks = await BookmarkModel.find({ user_id: userId })
      .sort({
        created_at: -1,
      })
      .limit(15);
    return bookmarks.map((bookmark) => bookmark.toObject());
  } catch (error) {
    throw error;
  }
};

export const checkBookmark = async (
  userId: string | Id,
  articleId: string | Id,
) => {
  try {
    const bookmark = await BookmarkModel.findOne({
      user_id: userId,
      article_id: articleId,
    });
    return !!bookmark;
  } catch (error) {
    throw error;
  }
};

// delete bookmark by user id
export const deleteBookmarkByUserId = async (
  userId: string | Id,
  articleId: string | Id,
): Promise<IBookmark | null> => {
  try {
    const deletedBookmarkDoc = await BookmarkModel.findOneAndDelete({
      user_id: userId,
      article_id: articleId,
    });
    return deletedBookmarkDoc?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

// delete multiple bookmarks by user id
export const deleteBookmarksByUserId = async (
  userId: string | Id,
): Promise<number> => {
  try {
    const { deletedCount } = await BookmarkModel.deleteMany({
      user_id: userId,
    });
    return deletedCount;
  } catch (error) {
    throw error;
  }
};
