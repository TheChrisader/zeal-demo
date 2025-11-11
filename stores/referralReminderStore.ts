// stores/referralReminderStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Exponential backoff schedule in milliseconds
const BACKOFF_SCHEDULE = [
  3 * 24 * 60 * 60 * 1000, // 3 days
  7 * 24 * 60 * 60 * 1000, // 7 days
  14 * 24 * 60 * 60 * 1000, // 14 days
  30 * 24 * 60 * 60 * 1000, // 30 days
];

const MAX_BACKOFF_INDEX = BACKOFF_SCHEDULE.length - 1;

interface ReferralReminderState {
  // Dismissal tracking
  dismissalCount: number;
  lastDismissedAt: number | null;
  permanentlyDismissed: boolean;

  // Trigger tracking
  sessionPageViews: number;
  sessionStartTime: number;
  hasTriggeredThisSession: boolean;

  // Actions
  actions: {
    // Dismissal methods
    dismissTemporarily: () => void;
    dismissPermanently: () => void;

    // Trigger methods
    incrementPageViews: () => void;
    markAsTriggered: () => void;

    // Query methods
    shouldShowPopup: () => boolean;
    getNextShowTime: () => number | null;
    timeUntilNextShow: () => number | null;

    // Session management
    resetSession: () => void;
    checkAndResetSession: () => void;
  };
}

export const useReferralReminderStore = create<ReferralReminderState>()(
  persist(
    (set, get) => ({
      // Initial state
      dismissalCount: 0,
      lastDismissedAt: null,
      permanentlyDismissed: false,
      sessionPageViews: 0,
      sessionStartTime: Date.now(),
      hasTriggeredThisSession: false,

      actions: {
        dismissTemporarily: () => {
          const currentState = get();
          const newDismissalCount = currentState.dismissalCount + 1;

          set({
            dismissalCount: newDismissalCount,
            lastDismissedAt: Date.now(),
            hasTriggeredThisSession: false,
          });
        },

        dismissPermanently: () => {
          console.log("set dsmp");
          set({
            permanentlyDismissed: true,
            hasTriggeredThisSession: false,
          });
        },

        incrementPageViews: () => {
          const state = get();
          set({
            sessionPageViews: state.sessionPageViews + 1,
          });
        },

        markAsTriggered: () => {
          set({
            hasTriggeredThisSession: true,
          });
        },

        shouldShowPopup: () => {
          const state = get();

          // Don't show if permanently dismissed
          if (state.permanentlyDismissed) {
            return false;
          }

          // Don't show if already triggered this session
          if (state.hasTriggeredThisSession) {
            return false;
          }

          // Check if we're in a backoff period
          if (state.lastDismissedAt) {
            const backoffIndex = Math.min(
              state.dismissalCount,
              MAX_BACKOFF_INDEX,
            );
            const backoffTime = BACKOFF_SCHEDULE[backoffIndex];
            const timeSinceDismissal = Date.now() - state.lastDismissedAt;

            if (timeSinceDismissal < backoffTime) {
              return false;
            }
          }

          // Trigger conditions
          const timeOnSite = Date.now() - state.sessionStartTime;
          const timeConditionMet = timeOnSite >= 30 * 1000; // 30 seconds
          const pageViewConditionMet = state.sessionPageViews >= 3;

          return timeConditionMet || pageViewConditionMet;
        },

    
        getNextShowTime: () => {
          const state = get();

          if (state.permanentlyDismissed) {
            return null;
          }

          if (state.lastDismissedAt) {
            const backoffIndex = Math.min(
              state.dismissalCount,
              MAX_BACKOFF_INDEX,
            );
            const backoffTime = BACKOFF_SCHEDULE[backoffIndex];
            return state.lastDismissedAt + backoffTime;
          }

          return null;
        },

        timeUntilNextShow: () => {
          const state = get();
          const nextShowTime = state.actions.getNextShowTime();

          if (nextShowTime === null) {
            return null;
          }

          return Math.max(0, nextShowTime - Date.now());
        },

        resetSession: () => {
          set({
            sessionPageViews: 0,
            sessionStartTime: Date.now(),
            hasTriggeredThisSession: false,
          });
        },

        checkAndResetSession: () => {
          const state = get();
          const sessionAge = Date.now() - state.sessionStartTime;

          // Reset session if it's been more than 30 minutes
          if (sessionAge > 30 * 60 * 1000) {
            state.actions.resetSession();
          }
        },
      },
    }),
    {
      name: "zealnews-referral-reminder-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dismissalCount: state.dismissalCount,
        lastDismissedAt: state.lastDismissedAt,
        permanentlyDismissed: state.permanentlyDismissed,
        sessionPageViews: state.sessionPageViews,
        sessionStartTime: state.sessionStartTime,
        hasTriggeredThisSession: state.hasTriggeredThisSession,
      }),
    },
  ),
);
