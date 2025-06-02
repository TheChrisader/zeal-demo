// components/cta/sticky-newsletter-banner.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Send,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useCtaDismissStore } from "@/stores/ctaStore";
import { cn } from "@/lib/utils";

const bannerFormSchema = z.object({
  email: z.string().email({ message: "Valid email required." }),
});
type BannerFormValues = z.infer<typeof bannerFormSchema>;

interface StickyNewsletterBannerProps {
  position?: "top" | "bottom";
  mainText?: string;
  subText?: string;
  sourceName?: string; // For API tracking
}

export function StickyNewsletterBanner({
  position = "bottom",
  mainText = "Stay Informed with ZealNews",
  subText = "Get the latest updates and exclusive content delivered straight to your inbox.",
  sourceName = "sticky-banner",
}: StickyNewsletterBannerProps) {
  const { shouldShowStickyBanner, dismissStickyBanner, checkStickyBannerTTL } =
    useCtaDismissStore((state) => state.actions);
  const isBannerEffectivelyVisible = useCtaDismissStore((state) =>
    state.actions.shouldShowStickyBanner(),
  );
  const [isVisibleClient, setIsVisibleClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: { email: "" },
  });

  // Determine visibility after client-side hydration
  // useEffect(() => {
  //   if (!dismissedStickyBanner) {
  //     // Delay showing the banner slightly to avoid layout shifts on load
  //     const timer = setTimeout(() => {
  //       setIsVisible(true);
  //     }, 1500); // Adjust delay as needed
  //     return () => clearTimeout(timer);
  //   } else {
  //     setIsVisible(false);
  //   }
  // }, [dismissedStickyBanner]);

  // const handleDismiss = () => {
  //   ctaActions.dismissStickyBanner();
  //   setIsVisible(false);
  // };

  useEffect(() => {
    checkStickyBannerTTL();

    // On component mount (client-side), evaluate if the banner should be shown
    if (shouldShowStickyBanner()) {
      const timer = setTimeout(() => {
        setIsVisibleClient(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsVisibleClient(false);
    }
  }, [shouldShowStickyBanner]); // Re-run if shouldShowStickyBanner function reference changes (though it shouldn't often)

  const handleDismiss = () => {
    dismissStickyBanner(); // This will now store the timestamp
    setIsVisibleClient(false);
  };

  async function onSubmit(data: BannerFormValues) {
    setIsLoading(true);
    setSubmissionStatus(null);
    setShowSuccessMessage(false);

    try {
      const response = await fetch("/api/v1/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, source: sourceName }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Subscription failed.");

      setSubmissionStatus({
        message: result.message || "Subscribed successfully!",
        type: "success",
      });
      setShowSuccessMessage(true);
      form.reset();
      // Optionally auto-dismiss after a few seconds on success
      setTimeout(() => {
        handleDismiss(); // Dismiss after successful subscription
      }, 3000);
    } catch (error: any) {
      setSubmissionStatus({
        message: error.message || "Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const bannerVariants = {
    hidden: { opacity: 0, y: position === "bottom" ? 50 : -50 },
    visible: { opacity: 1, y: 0 },
    exit: {
      opacity: 0,
      y: position === "bottom" ? 50 : -50,
      transition: { duration: 0.3 },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, height: 0, marginTop: 0 },
    visible: { opacity: 1, height: "auto", marginTop: "0.5rem" },
  };

  if (!isVisibleClient && !showSuccessMessage) {
    // Keep showing if success message is active before full dismiss
    return null;
  }

  return (
    <AnimatePresence>
      {isVisibleClient && (
        <motion.div
          key="sticky-banner"
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            "fixed left-0 right-0 z-50 bg-neutral-800 text-white shadow-xl print:hidden",
            position === "bottom"
              ? "bottom-0 border-t border-neutral-700"
              : "top-0 border-b border-neutral-700",
          )}
        >
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-6">
              {/* Left side: Text content */}
              <div className="flex-grow text-center sm:text-left">
                <div className="mb-1 flex items-center justify-center sm:mb-0 sm:justify-start">
                  <Mail className="mr-2 hidden h-5 w-5 text-blue-400 sm:inline-block" />
                  <h3 className="text-md font-semibold sm:text-lg">
                    {mainText}
                  </h3>
                </div>
                <p className="hidden text-xs text-neutral-300 sm:text-sm md:block">
                  {subText}
                </p>
              </div>

              {/* Right side: Form or Success Message */}
              <div className="w-full flex-shrink-0 sm:w-auto sm:max-w-sm">
                {!showSuccessMessage ? (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="flex w-full flex-col items-stretch gap-2 sm:flex-row"
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="flex-grow">
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="email"
                                  placeholder="your.email@example.com"
                                  {...field}
                                  disabled={isLoading}
                                  className="h-10 w-full border-neutral-600 bg-neutral-700 pr-10 text-sm text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-blue-500 sm:h-11 sm:pr-0" // No icon inside input to save space
                                />
                                {isLoading && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage className="mt-1 px-1 text-xs text-red-400 sm:hidden" />{" "}
                            {/* Show on mobile */}
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        variant="default"
                        size="default"
                        className="h-10 whitespace-nowrap bg-primary px-4 text-sm font-semibold text-white hover:bg-blue-700 sm:h-11"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <span className="hidden sm:inline">Subscribe</span>
                            <Send className="h-4 w-4 sm:hidden" />
                          </>
                        )}
                      </Button>
                    </form>
                    <AnimatePresence>
                      {submissionStatus &&
                        submissionStatus.type === "error" && (
                          <motion.p
                            key="banner-error-message"
                            variants={messageVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="mt-1.5 text-center text-xs text-red-400 sm:text-left"
                          >
                            <AlertTriangle className="relative -top-px mr-1 inline h-3.5 w-3.5" />
                            {submissionStatus.message}
                          </motion.p>
                        )}
                    </AnimatePresence>
                  </Form>
                ) : (
                  // Success Message
                  <motion.div
                    key="success-message"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center rounded-md bg-green-600 p-2 text-center sm:text-left"
                  >
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-white" />
                    <p className="text-sm font-medium text-white">
                      {submissionStatus?.message}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Dismiss Button - only show if not in success state (or always allow dismiss) */}
              {!showSuccessMessage && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDismiss}
                  className="absolute right-1.5 top-1.5 h-auto w-auto p-1.5 text-neutral-400 hover:bg-neutral-700 hover:text-white sm:relative sm:right-auto sm:top-auto"
                  aria-label="Dismiss newsletter banner"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
