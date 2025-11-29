"use client";
import { useEffect, useRef } from "react";

type Props = {
  slug: string;
  categories: string[];
};

export default function ArticleTracker({ slug, categories }: Props) {
  const hasFired = useRef(false);

  useEffect(() => {
    // 1. Check if React Effect already ran (Strict Mode fires twice in dev)
    if (hasFired.current) return;
    hasFired.current = true;

    if (!slug || categories?.length === 0) return;

    // 2. Check Session Storage to prevent duplicate views on Refresh
    // Key example: "viewed-my-article-slug"
    const storageKey = `viewed-${slug}`;
    const alreadyViewed = sessionStorage.getItem(storageKey);

    if (!alreadyViewed) {
      // Send the tracking event
      fetch("/api/v1/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, categories }),
      })
        .then(() => {
          // Mark as viewed for this browser session
          sessionStorage.setItem(storageKey, "true");
        })
        .catch((err) => console.error(err));
    }
  }, [slug, categories]);

  return null;
}
