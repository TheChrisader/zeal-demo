"use client";
import React, { useState, useEffect } from "react";
import { useReferral } from "@/hooks/useReferral";
import { toast } from "sonner";

const AnimatedHero: React.FC = () => {
  const [email, setEmail] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [showLinkPreview, setShowLinkPreview] = useState(false);
  const [countdown, setCountdown] = useState("75:08:39");
  const [copyButtonText, setCopyButtonText] = useState("Copy");
  const [isLoading, setIsLoading] = useState(false);
  const { referralCode: urlReferralCode } = useReferral();

  // Countdown timer logic - counts down to Friday 5 PM WAT
  useEffect(() => {
    const getNextFridayFive = () => {
      const now = new Date();
      const target = new Date(now);
      const day = now.getDay();
      const daysUntilFriday = (5 - day + 7) % 7 || 7;
      target.setDate(now.getDate() + daysUntilFriday);
      target.setHours(17, 0, 0, 0);
      return target;
    };

    const startCountdown = () => {
      const target = getNextFridayFive();

      const tick = () => {
        const diff = Math.max(0, target - new Date());
        const hrs = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0");
        const mins = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
        const secs = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");
        setCountdown(`${hrs}:${mins}:${secs}`);
      };

      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    };

    const cleanup = startCountdown();
    return cleanup;
  }, []);

  const handleGenerateLink = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email to generate a link.");
      return;
    }

    setIsLoading(true);

    try {
      const handle = email
        .split("@")[0]
        .replace(/[^a-z0-9]/gi, "")
        .toLowerCase();

      const response = await fetch("/api/v1/referral/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          handle,
          referral_code: urlReferralCode || undefined,
          newsletter_opt_in: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate referral link");
      }

      setReferralLink(data.referral_link);
      setShowLinkPreview(true);

      if (data.already_exists) {
        toast.success(data.message);
      } else {
        toast.success(
          "Account created! Check your email to verify and set your password."
        );
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopyButtonText("Copied");
      setTimeout(() => setCopyButtonText("Copy"), 1500);
      toast.success("Link copied to clipboard!");
    } catch (e) {
      toast.error("Copy failed, please select and copy manually.");
    }
  };

  return (
    <header className="relative py-20 text-white">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animated-hero"></div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 md:flex-row">
        <div className="text-center md:w-2/3 md:text-left">
          <h1 className="text-4xl font-extrabold leading-tight drop-shadow-md md:text-5xl">
            Influence Africa's News — Get Rewarded Weekly
          </h1>

          <p className="mt-4 max-w-xl text-lg opacity-90">
            Share ZealNews and earn entries for every verified signup. Top
            referrers win cash and branded merch every Friday at 5 PM (WAT).
          </p>

          <form
            className="mt-6 flex flex-col items-center gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerateLink();
            }}
          >
            <input
              aria-label="email"
              type="email"
              id="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-full px-4 py-3 text-slate-800 focus:outline-none disabled:opacity-50 sm:w-72"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="transform rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 shadow transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="size-4 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent"></div>
                  Creating...
                </span>
              ) : (
                "Generate Referral Link"
              )}
            </button>
          </form>

          {showLinkPreview && (
            <div className="mt-4 rounded-lg bg-white/10 backdrop-blur-sm p-4">
              <p className="text-sm opacity-90">
                Your referral link:
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="break-all font-mono text-sm font-semibold">
                  {referralLink}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="rounded bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30 transition"
                >
                  {copyButtonText}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-3 md:justify-start">
            <div className="rounded-full bg-white/10 px-3 py-2 text-sm">
              Next draw: <strong>Fri • 5:00 PM (WAT)</strong>
            </div>

            <div className="rounded-full bg-white/10 px-3 py-2 text-sm">
              Draw closes in: <strong>{countdown}</strong>
            </div>
          </div>
        </div>

        <div className="md:w-1/3">
          {/* Prize card */}
          <div className="glass rounded-2xl p-6 text-slate-900 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-80">This week's grand prize</div>
                <div className="mt-2 text-2xl font-bold">
                  ₦50,000 + Branded T-Shirt
                </div>
              </div>

              {/* Trophy icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-14 w-14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M8 21h8M12 11v10M4 7h16l-2 5H6L4 7z"
                />
              </svg>
            </div>

            <ul className="mt-4 space-y-2 text-sm">
              <li>Share anywhere — WhatsApp, X (Twitter), LinkedIn</li>
              <li>Verified signups only • No spam</li>
              <li className="text-xs opacity-80">
                Tip: Add a short personal note — converts 2–3× better
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animated-hero {
          background: linear-gradient(135deg, #0ea5a4 0%, #059669 45%, #10b981 100%);
          background-size: 300% 300%;
          animation: floatGradient 12s ease infinite;
        }

        .glass {
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        @keyframes floatGradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </header>
  );
};

export default AnimatedHero;