"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getReferralAnalytics } from "@/services/referral.services";
import { IReferralAnalytics } from "@/types/referral.type";

interface UseReferralAnalyticsParams {
  enabled: boolean;
  referralCode: string | null;
}

export const useReferralAnalytics = ({
  enabled,
  referralCode,
}: UseReferralAnalyticsParams) => {
  const [analytics, setAnalytics] = useState<IReferralAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!enabled || !referralCode) {
        setIsLoading(false);
        return;
      }

      try {
        const analyticsData = await getReferralAnalytics();
        setAnalytics(analyticsData);
      } catch (error) {
        console.error("Failed to load referral analytics:", error);
        toast.error("Failed to load referral analytics");
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [enabled, referralCode]);

  return { analytics, isLoading };
};
