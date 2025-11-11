"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, ExternalLink, Gift, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "@/app/_components/useRouter";
import { Button } from "@/components/ui/button";
import { useReferralReminder } from "@/hooks/useReferralReminder";

// Animation variants
const popupVariants = {
  hidden: {
    opacity: 0,
    x: 400,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    x: 400,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1,
      duration: 0.3,
    },
  },
};

export default function ReferralReminderPopup() {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const { isVisible, hide, dismissTemporarily, dismissPermanently } =
    useReferralReminder();

  const AUTO_DISMISS_DURATION = 12 * 1000; // 8 seconds

  // Handle local countdown state
  useEffect(() => {
    if (isVisible) {
      setTimeRemaining(AUTO_DISMISS_DURATION);

      const updateCountdown = () => {
        if (!isPaused) {
          setTimeRemaining((prev) => {
            if (prev === null) return null;

            const newRemaining = Math.max(0, prev - 50);

            if (newRemaining <= 0) {
              dismissTemporarily();
              return null;
            }

            return newRemaining;
          });
        }
      };

      // Set up interval for smooth updates
      const interval = setInterval(updateCountdown, 50);

      return () => clearInterval(interval);
    } else {
      setTimeRemaining(null);
      setIsPaused(false);
    }
  }, [isVisible, isPaused, dismissTemporarily, AUTO_DISMISS_DURATION]);

  // Calculate progress percentage for auto-dismiss bar
  const progressPercentage =
    timeRemaining !== null ? (timeRemaining / AUTO_DISMISS_DURATION) * 100 : 0;
  const isAutoDismissActive = timeRemaining !== null && timeRemaining > 0;

  const handleGetReferralCode = () => {
    router.push("/settings/referral");
    hide();
  };

  const handleClose = () => {
    dismissTemporarily();
  };

  const handleNeverShow = () => {
    dismissPermanently();
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-4 right-4 z-50 max-w-sm"
          variants={popupVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div
            className="group relative rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Auto-dismiss progress bar */}
            {isAutoDismissActive && (
              <div className="absolute left-0 top-0 h-1 w-full overflow-hidden rounded-t-xl">
                <div
                  className={`h-full transition-all duration-100 ${
                    isPaused ? "bg-yellow-500" : "bg-primary"
                  }`}
                  style={{
                    width: `${progressPercentage}%`,
                    transition: isPaused ? "none" : "width 0.1s linear",
                  }}
                />
              </div>
            )}

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
            >
              <X className="size-3" />
            </button>

            {/* Content */}
            <motion.div
              className="flex items-start gap-3"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Icon */}
              <motion.div
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Gift className="size-5 text-primary" />
              </motion.div>

              {/* Text content */}
              <div className="min-w-0 flex-1">
                <h4 className="mb-1 text-sm font-semibold text-foreground">
                  Get Your Referral Code
                </h4>
                <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                  Invite friends and earn rewards when they sign up. Start
                  sharing today!
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      onClick={handleGetReferralCode}
                      size="sm"
                      className="h-7 px-3 text-xs font-medium"
                    >
                      <ExternalLink className="mr-1.5 size-3" />
                      Get Code
                    </Button>
                  </motion.div>

                  <button
                    onClick={handleNeverShow}
                    className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-3" />
                    Never show
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Auto-dismiss indicator */}
            {/* {isAutoDismissActive && (
          <div className="absolute -top-6 right-0 flex items-center gap-1 rounded-md border bg-background/90 px-2 py-1 text-xs text-muted-foreground">
            <Clock className={`size-3 ${isPaused ? "text-yellow-500" : ""}`} />
            <span>
              Auto-dismiss in{" "}
              {Math.ceil((timeRemaining || 0) / 1000)}s
              {isPaused && (
                <span className="ml-1 text-yellow-500 font-medium">
                  (paused)
                </span>
              )}
            </span>
          </div>
        )} */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
