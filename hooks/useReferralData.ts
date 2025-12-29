"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  getReferralAnalytics,
  generateReferralCode,
} from "@/services/referral.services";
import { IReferralAnalytics } from "@/types/referral.type";

interface ReferralData {
  analytics: IReferralAnalytics | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  referralCode: string | null;
  referralLink: string | null;
}

/**
 * Central hook for referral data management
 * Combines auth state with referral analytics
 * Fetches user progress when authenticated
 * Provides loading/error states
 */
export function useReferralData(): ReferralData {
  const { user, initialized } = useAuthStore();
  const [analytics, setAnalytics] = useState<IReferralAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && user) {
      setIsLoading(true);
      setError(null);

      getReferralAnalytics()
        .then((data) => {
          setAnalytics(data);

          // If user doesn't have a referral code yet, generate one
          if (!data.referral_code && user.id) {
            generateReferralCode(user.id)
              .then((result) => {
                // Update analytics with the new referral code
                setAnalytics((prev) =>
                  prev
                    ? {
                        ...prev,
                        referral_code: result.referral_code,
                        referral_link: `${window.location.origin}?ref=${result.referral_code}`,
                      }
                    : null
                );
              })
              .catch((err) => {
                console.error("Failed to generate referral code:", err);
                // Don't fail if code generation fails
              });
          }
        })
        .catch((err) => {
          console.error("Failed to fetch referral analytics:", err);
          setError(err.message || "Failed to load referral data");
        })
        .finally(() => setIsLoading(false));
    }
  }, [user, initialized]);

  // Get referral code from analytics or user
  const referralCode = analytics?.referral_code || user?.referral_code || null;

  // Generate referral link if we have a code
  const referralLink =
    referralCode && typeof window !== "undefined"
      ? `${window.location.origin}?ref=${referralCode}`
      : analytics?.referral_link || null;

  return {
    analytics,
    isLoading,
    error,
    isAuthenticated: !!user,
    referralCode,
    referralLink,
  };
}
