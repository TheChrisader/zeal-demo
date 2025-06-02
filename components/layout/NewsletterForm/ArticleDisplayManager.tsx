// components/articles/article-display-manager.tsx
"use client";

import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { EmailWallOverlay } from "./EmailWallOverlay";
// Assuming Article type is defined and imported
// import { Article } from '@/path/to/article/type';

interface Article {
  // Basic placeholder
  slug: string;
  title: string;
  fullContent: string;
  isPremium: boolean;
  author: string;
  publishedDate: string;
}

interface ArticleDisplayManagerProps {
  //   article: Article;
  shouldDisplayWall: boolean;
  isSubscribedInitially: boolean;
}

export function ArticleDisplayManager({
  shouldDisplayWall,
  isSubscribedInitially,
}: ArticleDisplayManagerProps) {
  const router = useRouter();
  const [showWall, setShowWall] = useState(false);
  const [isSubscribedForWall, setIsSubscribedForWall] = useState(
    isSubscribedInitially,
  );
  //   const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Determine if wall should be shown after initial client render
    // This check needs to happen client-side to access localStorage for newsletter sign-up state
    // if the cookie is not the only source of truth (e.g. immediate state after signup)
    // const shouldDisplayWall = shouldDisplayWall && !isSubscribedForWall;
    setShowWall(shouldDisplayWall && !isSubscribedForWall);

    if (shouldDisplayWall) {
      //   document.body.style.overflow = "hidden"; // Lock scroll
    } else {
      document.body.style.overflow = ""; // Unlock scroll
    }

    // Cleanup scroll lock on component unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [shouldDisplayWall, isSubscribedForWall]);

  const handleSubscriptionSuccessForWall = () => {
    setIsSubscribedForWall(true); // Update local state to hide wall
    setShowWall(false); // Explicitly hide wall
    document.body.style.overflow = ""; // Unlock scroll
    // The API call in NewsletterSignUpFormWapo sets the cookie.
    // router.refresh() ensures that on next navigation or refresh,
    // `isSubscribedInitially` will be correct from the server.
    router.refresh();
  };

  // For the teaser effect with client-side overlay:
  // We can either use CSS to limit the height of the visible content
  // or dynamically insert a "read more" gradient/break.
  // Here, we'll just show the full content and overlay it.
  // A more advanced version might truncate content before the wall.

  return (
    <div className="relative">
      {/* <div
        ref={contentRef}
        className={cn(
          "container mx-auto px-4 py-8 sm:px-6 lg:px-8",
          // Optionally add a class to fade out content behind the wall if `showWall`
          // e.g., showWall ? 'opacity-30 blur-sm' : ''
        )}
      >
        <article className="prose mx-auto max-w-3xl dark:prose-invert lg:prose-xl">
          <header className="mb-8">
            <h1 className="!mb-3 text-4xl font-bold lg:text-5xl">
              {article.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              By {article.author} • Published{" "}
              {new Date(article.publishedDate).toLocaleDateString()}
            </p>
          </header>
          <div dangerouslySetInnerHTML={{ __html: article.fullContent }} />
        </article>
      </div> */}

      <AnimatePresence>
        {showWall && (
          <EmailWallOverlay
            // articleTitle={article.title}
            // sourceName={`email-wall-overlay-${article.slug}`}
            onSubscriptionSuccess={handleSubscriptionSuccessForWall}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
