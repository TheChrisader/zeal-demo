import { z } from "zod";

/**
 * Schema for validating referral code generation requests
 */
export const GenerateReferralCodeSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

/**
 * Schema for validating referral code in signup
 */
export const ReferralCodeSchema = z.object({
  referral_code: z.string()
    .min(4, "Referral code must be at least 4 characters")
    .max(10, "Referral code must be no more than 10 characters")
    .optional(),
});

/**
 * Schema for validating referral code lookup
 */
export const ValidateReferralCodeSchema = z.object({
  code: z.string()
    .min(4, "Referral code must be at least 4 characters")
    .max(10, "Referral code must be no more than 10 characters"),
});

/**
 * Schema for validating admin referral summary query parameters
 */
export const AdminReferralSummaryQuerySchema = z.object({
  timeRange: z.enum(["7d", "30d", "90d"]).default("30d"),
});

/**
 * Schema for validating referral leaderboard query parameters
 */
export const ReferralLeaderboardQuerySchema = z.object({
  weekOffset: z.number().int().min(0).max(52).default(0),
  limit: z.number().int().min(1).max(100).default(50),
});

/**
 * Schema for validating admin referral user analytics parameters
 */
export const AdminReferralUserParamsSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// Type exports
export type GenerateReferralCodeDTO = z.infer<typeof GenerateReferralCodeSchema>;
export type ReferralCodeDTO = z.infer<typeof ReferralCodeSchema>;
export type ValidateReferralCodeDTO = z.infer<typeof ValidateReferralCodeSchema>;
export type AdminReferralSummaryQueryDTO = z.infer<typeof AdminReferralSummaryQuerySchema>;
export type ReferralLeaderboardQueryDTO = z.infer<typeof ReferralLeaderboardQuerySchema>;
export type AdminReferralUserParamsDTO = z.infer<typeof AdminReferralUserParamsSchema>;