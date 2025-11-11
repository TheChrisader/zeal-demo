"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { useReferralReminderStore } from "@/stores/referralReminderStore";

interface UseReferralReminderReturn {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  dismissTemporarily: () => void;
  dismissPermanently: () => void;
  timeUntilNextShow: number | null;
}


export const useReferralReminder = (): UseReferralReminderReturn => {
  const { user, isAuthenticated, hasReferralCode } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  const {
    actions: {
      shouldShowPopup,
      dismissTemporarily: dismissTemporarilyStore,
      dismissPermanently: dismissPermanentlyStore,
      incrementPageViews,
      markAsTriggered,
      resetSession,
      checkAndResetSession,
      timeUntilNextShow,
    },
  } = useReferralReminderStore();

  // Check session validity and reset if needed
  const checkSession = useCallback(() => {
    checkAndResetSession();
    incrementPageViews();
  }, [checkAndResetSession, incrementPageViews]);

  // Evaluate if popup should be shown
  const evaluateShowPopup = useCallback(() => {
    if (!isAuthenticated || !user) {
      return false;
    }

    // Don't show if user already has referral code
    if (hasReferralCode) {
      return false;
    }

    return shouldShowPopup();
  }, [isAuthenticated, user, hasReferralCode, shouldShowPopup]);

  // Show popup
  const show = useCallback(() => {
    setIsVisible(true);
    markAsTriggered();
  }, [markAsTriggered]);

  // Hide popup
  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Temporary dismissal
  const dismissTemporarily = useCallback(() => {
    dismissTemporarilyStore();
    hide();
  }, [dismissTemporarilyStore, hide]);

  
  // Permanent dismissal
  const dismissPermanently = useCallback(() => {
    dismissPermanentlyStore();
    hide();
  }, [dismissPermanentlyStore, hide]);

  // Initialize and monitor conditions
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    // Check session state
    checkSession();

    // Initial evaluation
    if (evaluateShowPopup()) {
      // Add a small delay to ensure smooth UX
      const timer = setTimeout(() => {
        show();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, checkSession, evaluateShowPopup, show]);

  // Periodic check for time-based triggers
  useEffect(() => {
    if (!isAuthenticated || !user || isVisible) {
      return;
    }

    const interval = setInterval(() => {
      if (evaluateShowPopup() && !isVisible) {
        show();
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, user, isVisible, evaluateShowPopup, show]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsVisible(false);
    };
  }, []);

  return {
    isVisible,
    show,
    hide,
    dismissTemporarily,
    dismissPermanently,
    timeUntilNextShow: timeUntilNextShow(),
  };
};