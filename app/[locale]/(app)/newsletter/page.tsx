"use client";

import { useEffect, useState } from "react";
import { fetcher } from "@/lib/fetcher";
import { z } from "zod";
import { NewsletterForm } from "./_components/NewsletterForm";
import { SuccessMessage } from "./_components/SuccessMessage";
import { LeftContent } from "./_components/LeftContent";
import { FeaturesList } from "./_components/FeaturesList";
import { LoadingScreen } from "./_components/LoadingScreen";

const newsletterSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export default function NewsletterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Default to "News" category if no specific category is needed
  const category = "News";

  // Check if user is already subscribed using cookies
  useEffect(() => {
    const hasSubscribed = document.cookie
      .split("; ")
      .find((row) => row.startsWith("zealnews_subscribed_newsletter="));

    if (hasSubscribed) {
      setSubmitSuccess(true);
    }

    // Set loading to false after checking subscription status
    setIsLoading(false);
  }, []);

  async function onSubmit(data: NewsletterFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetcher("/api/v1/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          categories: [category],
        }),
      });

      if (response) setSubmitSuccess(true);

      // if (response.message) {
      //   // Set cookie to indicate user has subscribed
      //   document.cookie =
      //     "zealnews_subscribed_newsletter=true; path=/; max-age=31536000"; // 1 year
      //   setSubmitSuccess(true);
      // }
    } catch (error: unknown) {
      setSubmitError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Reset states when leaving the page
  useEffect(() => {
    return () => {
      setSubmitSuccess(false);
      setSubmitError(null);
      setIsSubmitting(false);
      setIsLoading(false);
    };
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-62px)] items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      {isLoading ? (
        <LoadingScreen />
      ) : submitSuccess ? (
        <SuccessMessage />
      ) : (
        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left side - Content/illustration */}
          <LeftContent />

          {/* Right side - Form */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
              <NewsletterForm
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                submitError={submitError}
                category={category}
              />
            </div>

            {/* Features list */}
            <FeaturesList />
          </div>
        </div>
      )}
    </div>
  );
}
