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

// Type exports
export type GenerateReferralCodeDTO = z.infer<typeof GenerateReferralCodeSchema>;
export type ReferralCodeDTO = z.infer<typeof ReferralCodeSchema>;
export type ValidateReferralCodeDTO = z.infer<typeof ValidateReferralCodeSchema>;