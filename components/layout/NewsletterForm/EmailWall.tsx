// components/cta/email-wall.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // For refreshing data after subscription
import { LockKeyhole, Newspaper } from "lucide-react";
import { NewsletterSignUpForm } from ".";

interface EmailWallProps {
  articleTitle?: string;
  sourceName?: string; // e.g., "email-wall-article-slug"
}

export function EmailWall({ articleTitle, sourceName }: EmailWallProps) {
  const router = useRouter();
  const [isSubscribedClient, setIsSubscribedClient] = useState(false); // Local state to hide wall immediately

  const handleSubscriptionSuccess = () => {
    setIsSubscribedClient(true); // Optimistically hide the wall
    // Refresh the current route to re-fetch server data (including cookie check)
    // This will cause the Server Component (article page) to re-render with updated `isSubscribed` status
    router.refresh();
  };

  if (isSubscribedClient) {
    // This part might not even be reached if router.refresh() is quick enough
    // to re-render the parent server component which would then not render EmailWall.
    // But it's a good optimistic fallback.
    return (
      <div className="py-8 text-center">
        <Newspaper className="mx-auto mb-4 h-12 w-12 text-green-500" />
        <p className="text-lg font-medium">
          Thank you! Loading full content...
        </p>
      </div>
    );
  }

  return (
    <div className="my-10 rounded-lg border border-border bg-neutral-50 px-6 py-10 text-center shadow-md dark:bg-neutral-800/30 sm:px-10">
      <LockKeyhole className="mx-auto mb-4 h-12 w-12 text-blue-600 dark:text-blue-500" />
      <h2 className="mb-3 font-serif text-2xl font-bold text-neutral-800 dark:text-neutral-100 sm:text-3xl">
        Unlock Full Access
      </h2>
      <p className="mx-auto mb-6 max-w-lg text-sm text-neutral-600 dark:text-neutral-300 sm:text-base">
        You&apos;ve reached the end of the preview for &quot;
        {articleTitle || "this premium article"}&quot;. Subscribe to ZealNews to
        continue reading this and get unlimited access to all our premium
        content.
      </p>

      <div className="mx-auto max-w-md">
        <NewsletterSignUpForm
          onSubmitSuccess={handleSubscriptionSuccess}
          // We can omit onSubmitError if the form itself handles displaying the error message
          className="bg-transparent p-0 text-left shadow-none" // Override card styles from the form itself
        />
      </div>
      <p className="mt-6 text-xs text-neutral-500 dark:text-neutral-400">
        Already subscribed? Ensure cookies are enabled. Your access will be
        recognized automatically.
      </p>
    </div>
  );
}
