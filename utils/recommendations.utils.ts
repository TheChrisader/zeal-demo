import AnalyticsModel from "@/database/analytics/analytics.model";

export const generateRecommendations = async (userId: string) => {
  // Get user's reading history
  const userHistory = await AnalyticsModel.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: "$category",
        readCount: { $sum: 1 },
        avgReadingTime: { $avg: "$timeSpent" },
        completionRate: {
          $avg: { $cond: ["$readComplete", 1, 0] },
        },
      },
    },
    { $sort: { readCount: -1 } },
  ]);

  // Get trending articles in user's preferred categories
  const recommendations = await AnalyticsModel.aggregate([
    {
      $match: {
        category: { $in: userHistory.slice(0, 3).map((h) => h._id) },
        readAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    },
    {
      $group: {
        _id: "$postId",
        readCount: { $sum: 1 },
        avgTimeSpent: { $avg: "$timeSpent" },
        completionRate: { $avg: { $cond: ["$readComplete", 1, 0] } },
      },
    },
    { $sort: { readCount: -1, completionRate: -1 } },
    { $limit: 10 },
  ]);

  return recommendations;
};
