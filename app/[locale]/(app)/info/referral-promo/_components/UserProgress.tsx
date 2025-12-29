"use client";
import React from "react";
import { useReferralData } from "@/hooks/useReferralData";

const UserProgress: React.FC = () => {
  const { analytics, isAuthenticated, isLoading } = useReferralData();

  // For unauthenticated users, show mock/demo data
  const mockEntries = 3;
  const mockProgress = 25; // percentage

  // For authenticated users, use real data
  const entries = isAuthenticated ? analytics?.total_referrals || 0 : mockEntries;
  const progress = isAuthenticated ? Math.min(entries * 10, 100) : mockProgress; // 10% per referral
  const rank = isAuthenticated ? "—" : "—"; // Backend not ready for rank

  return (
    <div className="">
      <style jsx>{`
        .reveal {
          transform: translateY(14px);
          opacity: 0;
          transition: all 0.7s cubic-bezier(0.2, 0.9, 0.3, 1);
        }

        .reveal.is-visible {
          transform: translateY(0);
          opacity: 1;
        }

        .glass {
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .skeleton {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>

      <h3 className="text-2xl font-bold">Your Progress</h3>

      <p className="mt-2 text-sm opacity-80">
        {isAuthenticated
          ? "Track your referral progress and earnings."
          : "Sign up to track your referrals and climb the leaderboard!"}
      </p>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          <div className="h-4 w-full rounded-full bg-emerald-100 skeleton"></div>
          <div className="flex justify-between text-sm">
            <span className="skeleton text-emerald-100">Loading...</span>
            <span className="skeleton text-emerald-100">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="h-4 w-full overflow-hidden rounded-full bg-emerald-100">
            <div
              className="h-4 rounded-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="mt-3 flex justify-between text-sm">
            <span>
              Entries: <strong>{entries}</strong>
            </span>
            <span>
              Rank: <strong>{rank}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProgress;
