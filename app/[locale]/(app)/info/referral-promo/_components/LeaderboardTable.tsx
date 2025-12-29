"use client";
import React from "react";

const LeaderboardTable: React.FC = () => {
  return (
    <section id="leaderboard" className="reveal mt-12">
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
      `}</style>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Leaderboard</h2>

        <button
          disabled
          className="rounded bg-gray-200 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
          title="Coming soon"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50 p-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-8 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-emerald-800">
          Leaderboard coming soon!
        </h3>
        <p className="mt-2 text-sm text-emerald-700">
          Start referring friends to see your name on the leaderboard.
          <br />
          Top referrers win prizes every Friday!
        </p>
      </div>

      {/* Keep table structure for future implementation */}
      {/* Hidden until backend is ready */}
      <div className="mt-4 hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-lg bg-white shadow-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500">
                <th className="p-3">Rank</th>
                <th className="p-3">Handle</th>
                <th className="p-3">Verified Signups</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Data will be populated when backend is ready */}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardTable;
