"use client";
import { Menu } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { copyReferralLink } from "@/services/referral.services";
import { useAuthStore } from "@/stores/authStore";

import HowItWorks from "./_components/HowItWorks";
import LeaderboardPreview from "./_components/LeaderboardPreview";
import PrizeTiers from "./_components/PrizeTiers";
import ReferralPromo2 from "./_components/ReferralPromo2";
import ReferralPromoHero1 from "./_components/ReferralPromoHero1";
import WeeklyTimelineShare from "./_components/WeeklyTimelineShare";

const ReferralPromo1 = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuthStore();

  const handleGetLink = async () => {
    // If authenticated with referral code, copy referral link
    if (user?.referral_code) {
      const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}?ref=${user.referral_code}`;
      const success = await copyReferralLink(referralLink);
      if (success) {
        toast.success("Referral link copied to clipboard!");
      } else {
        toast.error("Failed to copy link");
      }
      return;
    }

    // If authenticated without referral code, scroll to signup
    if (user && !user.referral_code) {
      toast.info("Please generate your referral code first");
      return;
    }

    // If not authenticated, scroll to signup form
    document.querySelector("input[type='email']")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    (
      document.querySelector("input[type='email']") as HTMLInputElement
    )?.focus();
    toast.info("Please enter your email to get started");
  };

  return (
    <>
      {/* Header */}
      <header className="sticky top-14 z-20 border-b border-gray-200 bg-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile menu button */}
            <button
              className="p-2 lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="size-6" />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
              <a
                href="#how-it-works"
                className="text-gray-700 hover:text-gray-900"
              >
                How it works
              </a>
              <a href="#prizes" className="text-gray-700 hover:text-gray-900">
                Prizes
              </a>
              <a href="#timeline" className="text-gray-700 hover:text-gray-900">
                Timeline
              </a>
              <a
                href="#leaderboard"
                className="text-gray-700 hover:text-gray-900"
              >
                Leaderboard
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleGetLink}
                className="rounded bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              >
                GetLink
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {menuOpen && (
            <nav className="border-t border-gray-200 py-4 lg:hidden">
              <a href="#how-it-works" className="block py-2 text-gray-700">
                How it works
              </a>
              <a href="#prizes" className="block py-2 text-gray-700">
                Prizes
              </a>
              <a href="#timeline" className="block py-2 text-gray-700">
                Timeline
              </a>
              <a href="#leaderboard" className="block py-2 text-gray-700">
                Leaderboard
              </a>
            </nav>
          )}
        </div>
      </header>
      <div className="flex flex-col items-center justify-center bg-gray-100 px-4 lg:px-[80px]">
        <ReferralPromoHero1 />
        <HowItWorks />
        <PrizeTiers />
        <WeeklyTimelineShare />
        <LeaderboardPreview />
      </div>
    </>
  );
};

const Loader = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header skeleton */}
      <div className="sticky top-14 z-20 border-b border-gray-200 bg-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="size-6 animate-pulse rounded bg-gray-300"></div>
            <div className="hidden gap-8 lg:flex">
              <div className="h-6 w-20 animate-pulse rounded bg-gray-300"></div>
              <div className="h-6 w-16 animate-pulse rounded bg-gray-300"></div>
              <div className="h-6 w-20 animate-pulse rounded bg-gray-300"></div>
              <div className="h-6 w-20 animate-pulse rounded bg-gray-300"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-16 animate-pulse rounded bg-gray-300"></div>
              <div className="h-8 w-16 animate-pulse rounded bg-emerald-700"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex flex-col items-center justify-center px-4 py-12 lg:px-[80px]">
        <div className="w-full max-w-4xl">
          {/* Hero section skeleton */}
          <div className="mb-8 h-32 w-full animate-pulse rounded-lg bg-gray-300"></div>
          <div className="mx-auto mb-4 h-8 w-64 animate-pulse rounded bg-gray-300"></div>
          <div className="mx-auto mb-8 h-6 w-96 animate-pulse rounded bg-gray-300"></div>

          {/* Feature cards skeleton */}
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-4 size-12 animate-pulse rounded bg-gray-300"></div>
                <div className="mb-2 h-6 w-32 animate-pulse rounded bg-gray-300"></div>
                <div className="mb-2 h-4 w-full animate-pulse rounded bg-gray-300"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-300"></div>
              </div>
            ))}
          </div>

          {/* Additional content skeleton */}
          <div className="mb-4 h-20 w-full animate-pulse rounded bg-gray-300"></div>
          <div className="h-20 w-full animate-pulse rounded bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
};

const ReferralPromo = () => {
  const [variant, setVariant] = useState<"A" | "B" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a brief loading time to avoid flash
    const loadingTimer = setTimeout(() => {
      // Check for existing variant in localStorage
      const storedVariant = localStorage.getItem("referral_promo_variant");

      if (storedVariant === "A" || storedVariant === "B") {
        setVariant(storedVariant);
      } else {
        // Randomly assign variant (50/50 split)
        const newVariant = Math.random() < 0.5 ? "A" : "B";
        setVariant(newVariant);
        localStorage.setItem("referral_promo_variant", newVariant);
      }

      setIsLoading(false);
    }, 500); // 500ms loading delay

    return () => clearTimeout(loadingTimer);
  }, []);

  if (isLoading || !variant) {
    return <Loader />;
  }

  return variant === "A" ? <ReferralPromo1 /> : <ReferralPromo2 />;
};

export default ReferralPromo;
