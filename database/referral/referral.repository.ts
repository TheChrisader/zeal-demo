import { FilterQuery, ObjectId } from "mongoose";
import UserModel from "@/database/user/user.model";
import { findUserById, updateUser } from "@/database/user/user.repository";
import { Id, newId } from "@/lib/database";
import {
  IReferralUser,
  IAdminReferralSummary,
  IReferralLeaderboardEntry,
  IAdminReferralUserAnalytics,
} from "@/types/referral.type";
import { IUser } from "@/types/user.type";

/**
 * Generate a unique referral code
 * @returns A unique 6-7 character alphanumeric code
 */
export const generateReferralCode = async (): Promise<string> => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 6 + Math.floor(Math.random() * 2); // 6 or 7 characters

  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    let code = "";
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Check if code already exists
    const existingUser = await UserModel.findOne({ referral_code: code });
    if (!existingUser) {
      return code;
    }

    attempts++;
  }

  // Fallback to longer code if all attempts failed
  const timestamp = Date.now().toString(36).toUpperCase();
  return timestamp.slice(-6);
};

/**
 * Find user by referral code
 * @param code - The referral code to search for
 * @returns The user with the given referral code or null
 */
export const findUserByReferralCode = async (
  code: string,
): Promise<IUser | null> => {
  try {
    const normalizedCode = code.toUpperCase().trim();
    const user = await UserModel.findOne(
      { referral_code: normalizedCode },
      { password_hash: 0 },
    );
    return user?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Set or update a user's referral code
 * @param userId - The user ID to update
 * @param code - The referral code to set (optional, will generate if not provided)
 * @returns The updated user
 */
export const setUserReferralCode = async (
  userId: string | Id,
  code?: string,
): Promise<IUser | null> => {
  try {
    let referralCode = code;

    if (!referralCode) {
      referralCode = await generateReferralCode();
    } else {
      // Normalize provided code
      referralCode = referralCode.toUpperCase().trim();
    }

    const updatedUser = await updateUser(
      {
        id: userId,
        referral_code: referralCode,
      },
      { newDocument: true },
    );

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

/**
 * Increment a user's referral count
 * @param referrerId - The user ID whose referral count to increment
 * @returns The updated user
 */
export const incrementReferralCount = async (
  referrerId: string | Id,
): Promise<IUser | null> => {
  try {
    const referrer = await findUserById(referrerId);
    if (!referrer) {
      throw new Error("Referrer not found");
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      referrerId,
      {
        $inc: { referral_count: 1 },
        $set: { updated_at: new Date() },
      },
      { new: true },
    ).select({ password_hash: 0 });

    return updatedUser?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Get referral statistics for a user
 * @param userId - The user ID to get stats for
 * @returns Referral statistics including recent referrals
 */
export const getReferralStats = async (
  userId: string | Id,
): Promise<IReferralUser[]> => {
  try {
    const referredUsers = await UserModel.find(
      { referred_by: userId },
      {
        password_hash: 0,
        email: 0,
        ip_address: 0,
        location: 0,
      },
    )
      .sort({ created_at: -1 })
      .limit(10)
      .lean({ virtuals: ["id"] });

    return referredUsers.map((user) => ({
      id: user.id,
      display_name: user.display_name,
      username: user.username,
      avatar: user.avatar,
      created_at: user.created_at,
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Apply a referral code during signup
 * @param referralCode - The referral code to apply
 * @param newUserId - The ID of the user being referred
 * @returns Success status
 */
export const applyReferralCode = async (
  referralCode: string,
  newUserId: string | Id,
): Promise<boolean> => {
  try {
    const referrer = await findUserByReferralCode(referralCode);
    if (!referrer) {
      return false;
    }

    // Prevent self-referral
    if (referrer.id.toString() === newUserId.toString()) {
      return false;
    }

    // Update the new user to mark who referred them
    await UserModel.findByIdAndUpdate(newUserId, {
      $set: {
        referred_by: referrer.id,
        updated_at: new Date(),
      },
    });

    // Increment the referrer's count
    await incrementReferralCount(referrer.id);

    return true;
  } catch (error) {
    console.error("Error applying referral code:", error);
    return false;
  }
};

// Admin-specific functions

/**
 * Get admin-level referral summary with time-series data
 * @param timeRange - Time range for data aggregation ("7d", "30d", "90d")
 * @returns Comprehensive referral summary with daily/weekly breakdown
 */
export const getAdminReferralSummary = async (
  timeRange: "7d" | "30d" | "90d" = "30d",
): Promise<IAdminReferralSummary> => {
  try {
    const now = new Date();
    let startDate: Date;
    let bucketInterval: number; // in days
    let groupFormat: string;

    switch (timeRange) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        bucketInterval = 1; // Daily
        groupFormat = "%Y-%m-%d";
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        bucketInterval = 7; // Weekly
        groupFormat = "%Y-%U"; // Year-week
        break;
      case "30d":
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        bucketInterval = 3; // Every 3 days
        groupFormat = "%Y-%m-%d";
        break;
    }

    // Get total referral counts and basic stats
    const [totalReferrals, totalReferrers] = await Promise.all([
      UserModel.countDocuments({ referred_by: { $exists: true, $ne: null } }),
      UserModel.countDocuments({ referral_count: { $gt: 0 } }),
    ]);

    // Get time-series data
    const timeSeriesData = await UserModel.aggregate([
      {
        $match: {
          referred_by: { $exists: true, $ne: null },
          created_at: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$created_at",
            },
          },
          count: { $sum: 1 },
          date: { $first: "$created_at" },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Create a map of dates to referral counts
    const dailyReferralMap = new Map();
    timeSeriesData.forEach((item) => {
      dailyReferralMap.set(item._id, item.count);
    });

    // Generate all dates from startDate to now and fill missing ones with 0
    const dailyReferrals = [];
    const currentDate = new Date(startDate);

    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      dailyReferrals.push({
        date: dateStr,
        count: dailyReferralMap.get(dateStr) || 0,
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate weekly aggregates
    const weeklyReferrals = await UserModel.aggregate([
      {
        $match: {
          referred_by: { $exists: true, $ne: null },
          created_at: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            week: {
              $dateToString: {
                format: "%Y-%U",
                date: "$created_at",
              },
            },
          },
          count: { $sum: 1 },
          startDate: { $min: "$created_at" },
        },
      },
      { $sort: { startDate: 1 } },
    ]);

    // Create a map of weeks to referral counts
    const weeklyReferralMap = new Map();
    weeklyReferrals.forEach((item) => {
      weeklyReferralMap.set(item._id.week, item.count);
    });

    // Generate all weeks from startDate to now and fill missing ones with 0
    const formattedWeeklyReferrals = [];

    // Get the week number for the start date
    const startOfWeek = new Date(startDate);
    const dayOfWeek = startOfWeek.getDay();
    const sundayOffset = dayOfWeek; // Days until Sunday (0 = Sunday)
    startOfWeek.setDate(startOfWeek.getDate() - sundayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get the week number for the current date
    const endOfWeek = new Date(now);
    const currentDayOfWeek = endOfWeek.getDay();
    endOfWeek.setDate(endOfWeek.getDate() - currentDayOfWeek);
    endOfWeek.setHours(0, 0, 0, 0);

    // Generate all weeks between start and end
    while (startOfWeek <= endOfWeek) {
      const year = startOfWeek.getFullYear();
      const weekNumber = Math.ceil(((startOfWeek.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7);
      const weekStr = `${year}-${String(weekNumber).padStart(2, '0')}`;

      formattedWeeklyReferrals.push({
        week: weekStr,
        count: weeklyReferralMap.get(weekStr) || 0,
      });

      // Move to next week
      startOfWeek.setDate(startOfWeek.getDate() + 7);
    }

    return {
      total_referrals: totalReferrals,
      total_referrers: totalReferrers,
      average_referrals_per_referrer:
        totalReferrers > 0
          ? Math.round((totalReferrals / totalReferrers) * 100) / 100
          : 0,
      daily_referrals: dailyReferrals,
      weekly_referrals: formattedWeeklyReferrals,
    };
  } catch (error) {
    console.error("Error getting admin referral summary:", error);
    throw error;
  }
};

/**
 * Get weekly referral leaderboard
 * @param weekOffset - Number of weeks to offset from current week (0 = current week)
 * @param limit - Maximum number of entries to return
 * @returns Array of leaderboard entries with rankings
 */
export const getReferralLeaderboard = async (
  weekOffset: number = 0,
  limit: number = 50,
): Promise<IReferralLeaderboardEntry[]> => {
  try {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - currentDay + weekOffset * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Get users with referrals in the specified week
    const leaderboardData = await UserModel.aggregate([
      {
        $match: {
          referral_count: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "referred_by",
          as: "referred_users_in_week",
          pipeline: [
            {
              $match: {
                created_at: { $gte: weekStart, $lte: weekEnd },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          recent_referrals: { $size: "$referred_users_in_week" },
        },
      },
      {
        $match: {
          recent_referrals: { $gt: 0 },
        },
      },
      {
        $project: {
          user_id: { $toString: "$_id" },
          display_name: 1,
          username: 1,
          avatar: 1,
          referral_count: 1,
          recent_referrals: 1,
          created_at: 1,
        },
      },
      { $sort: { recent_referrals: -1, referral_count: -1 } },
      { $limit: limit },
    ]);

    // Add rankings
    const leaderboardWithRanks = leaderboardData.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return leaderboardWithRanks;
  } catch (error) {
    console.error("Error getting referral leaderboard:", error);
    throw error;
  }
};

/**
 * Get detailed analytics for a specific referrer
 * @param userId - The user ID to get analytics for
 * @returns Detailed referrer analytics or null if not found
 */
export const getAdminReferralUserAnalytics = async (
  userId: string,
): Promise<IAdminReferralUserAnalytics | null> => {
  try {
    // Get the user with referral code
    const user = await UserModel.findById(userId)
      .select({
        password_hash: 0,
        ip_address: 0,
        location: 0,
      })
      .lean({ virtuals: ["id"] });

    if (!user || !user.referral_code) {
      return null;
    }

    // Get all referred users
    const referredUsers = await UserModel.find(
      { referred_by: userId },
      {
        password_hash: 0,
        email: 0,
        ip_address: 0,
        location: 0,
      },
    )
      .sort({ created_at: -1 })
      .lean({ virtuals: ["id"] });

    // Calculate current week's Monday-Friday date range
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDay === 0 ? 6 : currentDay - 1; // Calculate days until Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4); // Friday is 4 days after Monday
    friday.setHours(23, 59, 59, 999);

    // If today is before Friday, only show up to today
    const endDate = now < friday ? now : friday;

    // Get daily referral trends for current week (Monday-Friday)
    const dailyReferrals = await UserModel.aggregate([
      {
        $match: {
          referred_by: newId(userId),
          created_at: { $gte: monday, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$created_at",
            },
          },
          count: { $sum: 1 },
          date: { $first: "$created_at" },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Create a map of dates to referral counts
    const referralMap = new Map();
    dailyReferrals.forEach((item) => {
      referralMap.set(item._id, item.count);
    });

    // Generate all dates from Monday to endDate and fill missing ones with 0
    const allDates = [];
    const currentDate = new Date(monday);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      allDates.push({
        date: dateStr,
        count: referralMap.get(dateStr) || 0,
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get recent referrals for conversion rate calculation
    const recentReferrals = referredUsers.slice(0, 10).map((referredUser) => ({
      id: referredUser.id,
      display_name: referredUser.display_name,
      username: referredUser.username,
      avatar: referredUser.avatar,
      created_at: referredUser.created_at,
    }));

    // Calculate conversion rate (simplified - active referrals)
    const conversionRate =
      referredUsers.length > 0
        ? Math.round(
            (referredUsers.filter(
              (u) => u.last_login_at && u.last_login_at > u.created_at,
            ).length /
              referredUsers.length) *
              100,
          )
        : 0;

    return {
      user: {
        id: user.id,
        display_name: user.display_name,
        username: user.username,
        avatar: user.avatar,
        email: user.email,
        referral_code: user.referral_code,
        created_at: user.created_at,
      },
      referral_stats: {
        total_referrals: referredUsers.length,
        referral_conversion_rate: conversionRate,
        recent_referrals: recentReferrals,
      },
      daily_referrals: allDates,
    };
  } catch (error) {
    console.error("Error getting admin referral user analytics:", error);
    throw error;
  }
};
