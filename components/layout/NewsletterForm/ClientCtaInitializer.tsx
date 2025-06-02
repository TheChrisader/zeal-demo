// components/layout/ClientAppInitializer.tsx
"use client";

import { useEffect } from "react";
import { useCtaDismissStore } from "@/stores/ctaStore";

export default function ClientCtaInitializer() {
  useEffect(() => {
    // This runs once on the client when the app mounts
    useCtaDismissStore.getState().actions.checkStickyBannerTTL();
    console.log("CTA TTL Checked on app initialization.");
  }, []);

  return null; // This component doesn't render anything itself
}
