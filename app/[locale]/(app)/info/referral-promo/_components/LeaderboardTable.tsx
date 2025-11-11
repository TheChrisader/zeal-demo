"use client";
import React, { useState } from "react";

interface LeaderboardEntry {
  rank: number;
  handle: string;
  signups: number;
  status: string;
}

const LeaderboardTable: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([
    { rank: 1, handle: "@amina", signups: 42, status: "Hot Streak" },
    { rank: 2, handle: "@tobi", signups: 39, status: "Consistent" },
    { rank: 3, handle: "@kwame", signups: 36, status: "Rising" },
    { rank: 4, handle: "@zara", signups: 30, status: "Rising" },
    { rank: 5, handle: "@obi", signups: 27, status: "Rising" },
  ]);

  const refreshLeaderboard = () => {
    // Simulate refreshing with random variations
    const refreshedData = leaderboardData.map((entry) => ({
      ...entry,
      signups: entry.signups + Math.floor(Math.random() * 3) - 1, // Random +/- 1 or 0
    }));

    // Sort by signups again
    refreshedData.sort((a, b) => b.signups - a.signups);

    // Update ranks
    refreshedData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    setLeaderboardData(refreshedData);
  };

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
        <h2 className="text-2xl font-bold">Leaderboard (preview)</h2>

        <button
          onClick={refreshLeaderboard}
          className="rounded bg-white/90 px-3 py-2 text-sm hover:bg-white"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full rounded-lg bg-white shadow-sm">
          <thead>
            <tr className="text-left text-xs uppercase">
              <th className="p-3">Rank</th>
              <th className="p-3">Handle</th>
              <th className="p-3">Verified Signups</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {leaderboardData.map((entry) => (
              <tr key={entry.rank} className="border-t">
                <td className="p-3 font-semibold">{entry.rank}</td>
                <td className="p-3">{entry.handle}</td>
                <td className="p-3">{entry.signups}</td>
                <td className="p-3 text-emerald-600">{entry.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default LeaderboardTable;
