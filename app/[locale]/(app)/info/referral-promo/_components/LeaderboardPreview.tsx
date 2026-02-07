"use client";
import React from "react";
import { useRouter } from "@/app/_components/useRouter";
import { useReferral } from "@/hooks/useReferral";

// SECTION: Main Leaderboard Component
const LeaderboardPreview: React.FC = () => {
  const router = useRouter();
  const { referralCode: urlReferralCode } = useReferral();

  const handleRedirectToSignup = () => {
    const params = new URLSearchParams({
      promo: "true",
      ...(urlReferralCode && { ref: urlReferralCode }),
    });
    router.push(`/signup?${params.toString()}`);
  };

  return (
    // Page container with a light gray background to match the image
    <div id="leaderboard" className="min-h-screen w-full font-sans">
      {/* Main content area with padding */}
      <div className="py-10">
        <div className="mx-auto">
          {/* Header Section */}
          <header>
            <h1 className="text-3xl font-bold text-green-800">Leaderboard</h1>
            <p className="mt-2 max-w-[500px] text-sm text-green-900 opacity-90">
              View The Top Referrers.
            </p>
          </header>

          {/* Empty State */}
          <div className="mt-8 rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-12 text-center">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </div>
            <h2 className="mb-3 text-2xl font-bold text-green-800">
              Be the first to refer!
            </h2>
            <p className="mx-auto max-w-md text-green-700">
              Top referrers win prizes every Friday. Sign up and start sharing
              your link to climb the leaderboard.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleRedirectToSignup}
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
              >
                Get Your Referral Link
              </button>
            </div>
          </div>

          {/* Keep table structure hidden for future implementation */}
          <div className="mt-8 hidden">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  {/* Table Header */}
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-600"
                      >
                        Rank
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-600"
                      >
                        Handle
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-600"
                      >
                        Verified signups
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-600"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-gray-200">
                    {/* Data will be populated when backend is ready */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPreview;
