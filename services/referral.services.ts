import { fetcher } from "@/lib/fetcher";
import { IReferralAnalytics } from "@/types/referral.type";

/**
 * Generate a referral code for the current user
 * @param userId - The user ID to generate a referral code for
 * @returns Promise resolving to the generated referral code
 */
export const generateReferralCode = async (userId: string): Promise<{ referral_code: string; message: string }> => {
  try {
    const data = await fetcher("/api/v1/referral", {
      method: "POST",
      body: JSON.stringify({ userId }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Validate a referral code
 * @param code - The referral code to validate
 * @returns Promise resolving to validation result
 */
export const validateReferralCode = async (code: string): Promise<{
  valid: boolean;
  referrer?: {
    display_name: string;
    username: string;
    avatar: string | null;
  };
}> => {
  try {
    const data = await fetcher(`/api/v1/referral/${encodeURIComponent(code)}`);
    return data;
  } catch (error) {
    // If API returns 404, code is invalid
    if (error instanceof Error && error.message.includes("404")) {
      return { valid: false };
    }
    throw error;
  }
};

/**
 * Get referral analytics for the current user
 * @returns Promise resolving to referral analytics
 */
export const getReferralAnalytics = async (): Promise<IReferralAnalytics> => {
  try {
    const data = await fetcher("/api/v1/referral/analytics");
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Apply a referral code during signup
 * @param referralCode - The referral code to apply
 * @returns Promise resolving to success status
 */
export const useReferralCode = async (referralCode: string): Promise<boolean> => {
  try {
    const validation = await validateReferralCode(referralCode);
    return validation.valid;
  } catch (error) {
    console.error("Error validating referral code:", error);
    return false;
  }
};

/**
 * Generate a shareable referral link
 * @param referralCode - The referral code
 * @returns The full referral URL
 */
export const generateReferralLink = (referralCode: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  return `${baseUrl}?ref=${referralCode}`;
};

/**
 * Copy referral code to clipboard
 * @param referralCode - The referral code to copy
 * @returns Promise resolving to success status
 */
export const copyReferralCode = async (referralCode: string): Promise<boolean> => {
  try {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(referralCode);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to copy referral code:", error);
    return false;
  }
};

/**
 * Copy referral link to clipboard
 * @param referralLink - The referral link to copy
 * @returns Promise resolving to success status
 */
export const copyReferralLink = async (referralLink: string): Promise<boolean> => {
  try {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(referralLink);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to copy referral link:", error);
    return false;
  }
};