import { ObjectId as _ObjectId } from "mongoose";
import InfluencerModel from "@/database/influencer/influencer.model";
import UserModel from "@/database/user/user.model";
import { Id } from "@/lib/database";
import {
  IInfluencer,
  IInfluencerAnalytics,
  InfluencerStatus,
} from "@/types/referral.type";

/**
 * Create an influencer record and mark the user as an influencer
 * @param userId - The user ID to convert to influencer
 * @param status - The influencer status (default: "pending")
 * @param notes - Optional notes about the influencer
 * @returns The created influencer record
 */
export const createInfluencer = async (
  userId: string | Id,
  status: InfluencerStatus = "pending",
  notes: string | null = null,
): Promise<IInfluencer | null> => {
  try {
    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is already an influencer
    const existingInfluencer = await InfluencerModel.findOne({
      user_id: userId,
    });
    if (existingInfluencer) {
      throw new Error("User is already an influencer");
    }

    // Create influencer record
    const influencer = await InfluencerModel.create({
      user_id: userId,
      status,
      notes,
    });

    // Mark user as influencer
    await UserModel.findByIdAndUpdate(userId, {
      $set: { is_influencer: true },
    });

    return influencer?.toObject() || null;
  } catch (error) {
    console.error("Error creating influencer:", error);
    throw error;
  }
};

/**
 * Get influencer by user ID
 * @param userId - The user ID to lookup
 * @returns The influencer record or null
 */
export const getInfluencerByUserId = async (
  userId: string | Id,
): Promise<IInfluencer | null> => {
  try {
    const influencer = await InfluencerModel.findOne({ user_id: userId })
      .populate("user_id", "display_name username avatar email referral_code")
      .lean({ virtuals: ["id"] });
    return influencer || null;
  } catch (error) {
    console.error("Error getting influencer by user ID:", error);
    throw error;
  }
};

/**
 * Get influencer by influencer document ID
 * @param influencerId - The influencer document ID
 * @returns The influencer record or null
 */
export const getInfluencerById = async (
  influencerId: string | Id,
): Promise<IInfluencer | null> => {
  try {
    const influencer = await InfluencerModel.findById(influencerId)
      .populate("user_id", "display_name username avatar email referral_code")
      .lean({ virtuals: ["id"] });
    return influencer || null;
  } catch (error) {
    console.error("Error getting influencer by ID:", error);
    throw error;
  }
};

/**
 * Update influencer record
 * @param influencerId - The influencer document ID
 * @param updates - Updates to apply (status, notes)
 * @returns The updated influencer record or null
 */
export const updateInfluencer = async (
  influencerId: string | Id,
  updates: Partial<Pick<IInfluencer, "status" | "notes">>,
): Promise<IInfluencer | null> => {
  try {
    const influencer = await InfluencerModel.findByIdAndUpdate(
      influencerId,
      { $set: updates },
      { new: true },
    )
      .populate("user_id", "display_name username avatar email referral_code")
      .lean({ virtuals: ["id"] });

    return influencer || null;
  } catch (error) {
    console.error("Error updating influencer:", error);
    throw error;
  }
};

/**
 * Delete influencer record and remove influencer flag from user
 * @param influencerId - The influencer document ID
 * @returns The deleted influencer record or null
 */
export const deleteInfluencer = async (
  influencerId: string | Id,
): Promise<IInfluencer | null> => {
  try {
    const influencer = await InfluencerModel.findByIdAndDelete(influencerId);
    if (!influencer) {
      return null;
    }

    // Remove influencer flag from user
    await UserModel.findByIdAndUpdate(influencer.user_id, {
      $set: { is_influencer: false },
    });

    return influencer?.toObject() || null;
  } catch (error) {
    console.error("Error deleting influencer:", error);
    throw error;
  }
};

/**
 * List influencers with optional filtering
 * @param filters - Optional filters (status, limit, skip)
 * @returns Array of influencer records
 */
export const listInfluencers = async (
  filters: {
    status?: InfluencerStatus;
    limit?: number;
    skip?: number;
  } = {},
): Promise<IInfluencer[]> => {
  try {
    const { status, limit = 50, skip = 0 } = filters;

    const query: Record<string, unknown> = {};
    if (status) {
      query.status = status;
    }

    const influencers = await InfluencerModel.find(query)
      .populate("user_id", "display_name username avatar email referral_code")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: ["id"] });

    return influencers;
  } catch (error) {
    console.error("Error listing influencers:", error);
    throw error;
  }
};

/**
 * Get influencer analytics for admin dashboard
 * @returns Summary statistics including total influencers, active influencers, and referral counts
 */
export const getInfluencerAnalytics =
  async (): Promise<IInfluencerAnalytics> => {
    try {
      // Get total influencer counts by status
      const [totalInfluencers, activeInfluencers] = await Promise.all([
        InfluencerModel.countDocuments(),
        InfluencerModel.countDocuments({ status: "active" }),
      ]);

      // Get all influencer user IDs
      const influencerRecords = await InfluencerModel.find({})
        .select("user_id status joined_at")
        .lean();

      const influencerUserIds = influencerRecords.map((r) => r.user_id);

      // Get total referral count for influencers
      const influencerReferralData = await UserModel.aggregate([
        {
          $match: {
            _id: { $in: influencerUserIds },
          },
        },
        {
          $group: {
            _id: null,
            total_referrals: { $sum: "$referral_count" },
          },
        },
      ]);

      const totalInfluencerReferrals =
        influencerReferralData[0]?.total_referrals || 0;

      // Get detailed influencer data with user info
      const influencers = await UserModel.aggregate([
        {
          $match: {
            _id: { $in: influencerUserIds },
          },
        },
        {
          $lookup: {
            from: "influencers",
            localField: "_id",
            foreignField: "user_id",
            as: "influencer_data",
          },
        },
        {
          $unwind: "$influencer_data",
        },
        {
          $project: {
            user_id: { $toString: "$_id" },
            display_name: 1,
            username: 1,
            referral_count: 1,
            status: "$influencer_data.status",
            joined_at: "$influencer_data.joined_at",
          },
        },
        {
          $sort: { referral_count: -1 },
        },
      ]);

      return {
        total_influencers: totalInfluencers,
        active_influencers: activeInfluencers,
        total_influencer_referrals: totalInfluencerReferrals,
        influencers,
      };
    } catch (error) {
      console.error("Error getting influencer analytics:", error);
      throw error;
    }
  };

/**
 * Count influencers matching filters
 * @param filters - Optional filters (status)
 * @returns Count of matching influencers
 */
export const countInfluencers = async (
  filters: {
    status?: InfluencerStatus;
  } = {},
): Promise<number> => {
  try {
    const query: Record<string, unknown> = {};
    if (filters.status) {
      query.status = filters.status;
    }

    return await InfluencerModel.countDocuments(query);
  } catch (error) {
    console.error("Error counting influencers:", error);
    throw error;
  }
};
