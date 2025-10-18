"use client";

import { useEffect, useState } from "react";

/**
 * Client-side hook for managing referral codes from URL parameters and session storage
 * This hook doesn't rely on Next.js useSearchParams and can be used in any component
 */
export const useReferralClient = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const referralKey = 'referral_code';

    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const urlReferral = urlParams.get('ref');

    if (urlReferral) {
      // Store in sessionStorage if found in URL
      try {
        sessionStorage.setItem(referralKey, urlReferral);
        setReferralCode(urlReferral);
      } catch (error) {
        console.error('Failed to store referral code:', error);
      }
    } else {
      // Check sessionStorage if not in URL
      try {
        const storedReferral = sessionStorage.getItem(referralKey);
        if (storedReferral) {
          setReferralCode(storedReferral);
        }
      } catch (error) {
        console.error('Failed to retrieve referral code:', error);
      }
    }

    setIsLoaded(true);
  }, []);

  /**
   * Clear the stored referral code
   */
  const clearReferralCode = () => {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.removeItem('referral_code');
      setReferralCode(null);
    } catch (error) {
      console.error('Failed to clear referral code:', error);
    }
  };

  /**
   * Manually set a referral code
   */
  const setReferralCodeManually = (code: string) => {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.setItem('referral_code', code);
      setReferralCode(code);
    } catch (error) {
      console.error('Failed to set referral code:', error);
    }
  };

  return {
    referralCode,
    isLoaded,
    clearReferralCode,
    setReferralCodeManually,
  };
};