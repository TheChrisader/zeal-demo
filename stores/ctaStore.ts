// store/ctaStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const STICKY_BANNER_TTL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

interface CtaDismissState {
  // Store an object for sticky banner dismissal to include the timestamp
  stickyBannerDismissal: {
    dismissed: boolean;
    timestamp: number | null; // Timestamp of when it was dismissed
  };
  actions: {
    dismissStickyBanner: () => void;
    shouldShowStickyBanner: () => boolean;
    // Helper to re-evaluate if the banner should be shown (e.g., on app load)
    checkStickyBannerTTL: () => void;
  };
}

export const useCtaDismissStore = create<CtaDismissState>()(
  persist(
    (set, get) => ({
      stickyBannerDismissal: {
        dismissed: false,
        timestamp: null,
      },
      actions: {
        dismissStickyBanner: () =>
          set({
            stickyBannerDismissal: {
              dismissed: true,
              timestamp: Date.now(), // Record the current time
            },
          }),
        shouldShowStickyBanner: () => {
          const { dismissed, timestamp } = get().stickyBannerDismissal;
          if (!dismissed || !timestamp) {
            return true; // Not dismissed or no timestamp, so show
          }
          // Check if TTL has expired
          if (Date.now() - timestamp > STICKY_BANNER_TTL_MS) {
            // TTL expired, reset dismissal state so it can be shown again
            // Note: This reset will happen when shouldShowStickyBanner is called and TTL is found to be expired.
            // It might be cleaner to have a dedicated `checkStickyBannerTTL` action to call on app load.
            set({
              stickyBannerDismissal: { dismissed: false, timestamp: null },
            });
            return true; // Show it now that TTL is up
          }
          return false; // Dismissed and TTL is still valid
        },
        checkStickyBannerTTL: () => {
          // This function is called to explicitly check and reset if TTL expired.
          // Useful to call this once when the app/layout loads.
          const { dismissed, timestamp } = get().stickyBannerDismissal;
          if (
            dismissed &&
            timestamp &&
            Date.now() - timestamp > STICKY_BANNER_TTL_MS
          ) {
            set({
              stickyBannerDismissal: { dismissed: false, timestamp: null },
            });
          }
        },
      },
    }),
    {
      name: "zealnews-cta-dismiss-storage", // Changed name to avoid conflicts if old version exists
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        stickyBannerDismissal: state.stickyBannerDismissal,
      }),
    },
  ),
);
