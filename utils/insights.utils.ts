import AnalyticsModel from "@/database/analytics/analytics.model";

export const generateUserInsights = async (userId: string) => {
  const insights = await AnalyticsModel.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalArticlesRead: { $sum: 1 },
        totalReadingTime: { $sum: "$timeSpent" },
        avgReadingSpeed: { $avg: "$readingSpeed" },
        preferredReadingTimes: {
          $push: "$timeOfDay",
        },
        categoryDistribution: {
          $push: "$category",
        },
        deviceUsage: {
          $push: "$deviceType",
        },
      },
    },
  ]);

  // Process preferred reading times
  const timePreferences: { [key: string]: number } =
    insights[0].preferredReadingTimes.reduce(
      (acc: { [key: string]: number }, time: string) => {
        acc[time] = (acc[time] || 0) + 1;
        return acc;
      },
      {},
    );

  // Process category distribution
  const categories: { [key: string]: number } =
    insights[0].categoryDistribution.reduce(
      (acc: { [key: string]: number }, category: string) => {
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {},
    );

  return {
    readingHabits: {
      totalArticles: insights[0].totalArticlesRead,
      totalTime: insights[0].totalReadingTime,
      avgSpeed: Math.round(insights[0].avgReadingSpeed),
      preferredTimes: timePreferences,
      topCategories: Object.entries(categories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3),
    },
  };
};
