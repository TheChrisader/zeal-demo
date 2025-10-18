import { FilterQuery } from "mongoose";
import UserModel from "@/database/user/user.model";
import { findUserById, updateUser } from "@/database/user/user.repository";
import { Id } from "@/lib/database";
import { IReferralUser } from "@/types/referral.type";
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
