"use client";

import { useEffect } from "react";
import { useReferralClient } from "@/hooks/useReferralClient";

/**
 * Global component that initializes referral detection across the entire app.
 * This component ensures useReferralClient runs once at the app level to detect
 * referral codes from URL parameters and store them in sessionStorage.
 */
export function GlobalReferralInitializer() {
  const { isLoaded } = useReferralClient();

  useEffect(() => {
    // This component's only purpose is to ensure useReferralClient runs globally
    // The hook itself handles the URL parameter detection and sessionStorage storage
    if (isLoaded) {
      console.debug("Global referral initializer has loaded");
    }
  }, [isLoaded]);

  // This component doesn't render anything - it just initializes the hook
  return null;
}
