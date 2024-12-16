import { Id } from "@/lib/database";

import { IAnalytics } from "@/types/analytics.type";

import AnalyticsModel from "./analytics.model";

// update Analytics
export const updateAnalytics = async (
  user_id: string,
  post_id: string,
  data: Partial<IAnalytics>,
) => {
  try {
    const updatedAnalyticsDoc = await AnalyticsModel.findOneAndUpdate(
      { userId: user_id, postId: post_id },
      { $set: { ...data } },
      { new: true },
    );
    return updatedAnalyticsDoc?.toObject() || null;
  } catch (error) {
    throw error;
  }
};
