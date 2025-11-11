"use client";
import React from "react";

// SECTION: Type Definitions
// Defines the structure for a single referrer's data.
type ReferrerStatus = "Hot streak" | "Consistent" | "Rising";

interface Referrer {
  rank: number;
  handle: string;
  verifiedSignups: number;
  status: ReferrerStatus;
}

// SECTION: Data
// Mock data for the leaderboard, matching the provided image.
const leaderboardData: Referrer[] = [
  { rank: 1, handle: "@amina", verifiedSignups: 42, status: "Hot streak" },
  { rank: 2, handle: "@tobi", verifiedSignups: 39, status: "Consistent" },
  { rank: 3, handle: "@kwame", verifiedSignups: 36, status: "Consistent" },
  { rank: 4, handle: "@zara", verifiedSignups: 30, status: "Rising" },
  { rank: 5, handle: "@obi", verifiedSignups: 27, status: "Rising" },
];

// SECTION: Helper Components
// A reusable icon component for the dropdown arrow.
const ChevronDownIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    className={`h-5 w-5 ${className}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

// A component to render the status badge with styles based on the status type.
// This is designed to look like an interactive dropdown/button as in the image.
const StatusBadge: React.FC<{ status: ReferrerStatus }> = ({ status }) => {
  const commonClasses =
    "flex items-center justify-between w-[130px] text-sm font-medium py-1.5 px-3 rounded-lg cursor-pointer";

  if (status === "Hot streak") {
    return (
      <div className={`${commonClasses} bg-green-100 text-green-800`}>
        <span>{status}</span>
        <ChevronDownIcon className="text-green-700" />
      </div>
    );
  }

  // Consistent & Rising statuses share the same style
  return (
    <div
      className={`${commonClasses} border border-gray-300 bg-white text-gray-700`}
    >
      <span>{status}</span>
      <ChevronDownIcon className="text-gray-500" />
    </div>
  );
};

// SECTION: Main Leaderboard Component
const LeaderboardPreview: React.FC = () => {
  return (
    // Page container with a light gray background to match the image
    <div id="leaderboard" className="min-h-screen w-full font-sans">
      {/* Main content area with padding */}
      <div className="py-10">
        <div className="mx-auto">
          {/* Header Section */}
          <header>
            <h1 className="text-3xl font-bold text-green-800">
              Leaderboard (preview)
            </h1>
            <p className="mt-2 max-w-[500px] text-sm text-green-900 opacity-90">
              Top referrers update hourly. Verified signups only. Ties resolved
              by earliest timestamp.
            </p>
          </header>

          {/* Leaderboard Table Section */}
          <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
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
                  {leaderboardData.map((user) => (
                    <tr key={user.rank}>
                      <td className="whitespace-nowrap px-6 py-4 text-gray-800">
                        {user.rank}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                        {user.handle}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-gray-800">
                        {user.verifiedSignups}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPreview;
