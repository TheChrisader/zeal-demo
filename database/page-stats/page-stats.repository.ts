import { Id } from "@/lib/database";

import { IPageStats } from "@/types/page-stats.type";
import PageStatsModel from "./page-stats.model";

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear().toString(); // Get full year
  const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Get month (0-11, add 1)
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// create page stats
export const createPageStats = async (
  slug: string,
  category: string,
  date?: string,
): Promise<IPageStats> => {
  try {
    return await PageStatsModel.create({
      slug,
      category,
      date: date || getTodayDateString(),
      views: 0,
    });
  } catch (error) {
    throw error;
  }
};

// get page stats by slug and date
export const getPageStats = async (
  slug: string,
  date?: string,
): Promise<IPageStats | null> => {
  try {
    const pageStats = await PageStatsModel.findOne({
      slug,
      date: date || getTodayDateString(),
    });
    return pageStats?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

// get or create page stats (ensures stats exist for tracking)
export const getOrCreatePageStats = async (
  slug: string,
  category: string,
  date?: string,
): Promise<IPageStats> => {
  try {
    const targetDate = date || getTodayDateString();

    // Try to find existing stats
    let pageStats = await PageStatsModel.findOne({
      slug,
      date: targetDate,
    });

    // If not found, create new stats
    if (!pageStats) {
      pageStats = await PageStatsModel.create({
        slug,
        category,
        date: targetDate,
        views: 0,
      });
    }

    return pageStats.toObject();
  } catch (error) {
    throw error;
  }
};

// increment views for a page
export const incrementPageViews = async (
  slug: string,
  category: string,
  date?: string,
): Promise<IPageStats | null> => {
  try {
    const targetDate = date || getTodayDateString();

    const updatedPageStats = await PageStatsModel.findOneAndUpdate(
      { slug, category, date: targetDate },
      {
        $inc: { views: 1 },
      },
      {
        new: true,
        upsert: true,
      },
    );

    return updatedPageStats?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

// update page stats
export const updatePageStats = async (
  slug: string,
  date: string,
  data: Partial<Pick<IPageStats, "category" | "views">>,
): Promise<IPageStats | null> => {
  try {
    const updatedPageStats = await PageStatsModel.findOneAndUpdate(
      { slug, date },
      { $set: data },
      { new: true },
    );
    return updatedPageStats?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

// get page stats by category
export const getPageStatsByCategory = async (
  category: string,
  date?: string,
): Promise<IPageStats[]> => {
  try {
    const pageStats = await PageStatsModel.find({
      category,
      date: date || getTodayDateString(),
    }).sort({ views: -1 });

    return pageStats.map((stats) => stats.toObject());
  } catch (error) {
    throw error;
  }
};

// get page stats by date range
export const getPageStatsByDateRange = async (
  startDate: string,
  endDate: string,
  category?: string,
): Promise<IPageStats[]> => {
  try {
    const query: {
      date: {
        $gte: string;
        $lte: string;
      };
      category?: string;
    } = {
      date: { $gte: startDate, $lte: endDate },
    };

    if (category) {
      query.category = category;
    }

    const pageStats = await PageStatsModel.find(query).sort({
      date: -1,
      views: -1,
    });

    return pageStats.map((stats) => stats.toObject());
  } catch (error) {
    throw error;
  }
};

// get top pages by views
export const getTopPagesByViews = async (
  limit: number = 10,
  category?: string,
  date?: string,
): Promise<IPageStats[]> => {
  try {
    const query: {
      category?: string;
      date?: string;
    } = {};

    if (category) {
      query.category = category;
    }

    if (date) {
      query.date = date;
    }

    const pageStats = await PageStatsModel.find(query)
      .sort({ views: -1 })
      .limit(limit);

    return pageStats.map((stats) => stats.toObject());
  } catch (error) {
    throw error;
  }
};

// delete page stats
export const deletePageStats = async (
  slug: string,
  date: string,
): Promise<IPageStats | null> => {
  try {
    const deletedPageStats = await PageStatsModel.findOneAndDelete({
      slug,
      date,
    });
    return deletedPageStats?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

// increment page views for multiple categories
export const incrementPageViewsForCategories = async (
  slug: string,
  categories: string[],
  date?: string,
): Promise<IPageStats[]> => {
  try {
    const targetDate = date || getTodayDateString();

    // Create bulk operations for all categories
    const bulkOps = categories.map((category) => ({
      updateOne: {
        filter: { slug, category, date: targetDate },
        update: {
          $inc: { views: 1 },
        },
        upsert: true,
      },
    }));

    // Execute bulk operations
    await PageStatsModel.bulkWrite(bulkOps);

    // Fetch all updated documents
    const updatedPageStats = await PageStatsModel.find({
      slug,
      category: { $in: categories },
      date: targetDate,
    }).sort({ views: -1 });

    return updatedPageStats.map((stats) => stats.toObject());
  } catch (error) {
    throw error;
  }
};

// get total views by category
export const getTotalViewsByCategory = async (
  category: string,
  startDate?: string,
  endDate?: string,
): Promise<number> => {
  try {
    const query: {
      category: string;
      date?: {
        $gte: string;
        $lte: string;
      };
    } = { category };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const result = await PageStatsModel.aggregate([
      { $match: query },
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);

    return result[0]?.totalViews || 0;
  } catch (error) {
    throw error;
  }
};
