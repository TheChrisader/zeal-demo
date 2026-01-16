"use client";
import React from "react";

// SECTION: Data and Type Definitions
// Data for the prize tiers is structured here for easy management and scalability.
interface PrizeTier {
  category: string;
  amount: string;
  description?: string;
}

const prizeTiersData: PrizeTier[] = [
  {
    category: "Grand Prize",
    amount: "₦50,000",
    description: "+ ZealNews Branded T-SHirt",
  },
  {
    category: "1st Runner-up",
    amount: "₦30,000",
  },
  {
    category: "2nd Runner-up",
    amount: "₦20,000",
  },
  {
    category: "10 Consolidation Prize",
    amount: "₦5,000",
    description: "Distributed to 10 participants",
  },
];

// SECTION: Main Prize Tiers Component
// This component displays the prize tiers in a responsive grid layout.

const PrizeTiers: React.FC = () => {
  return (
    // Main container with a light background and padding
    <div id="prizes" className="w-full py-12 font-sans">
      <div className="">
        {/* Header Section */}
        <div className="mb-8 text-left">
          <h2 className="text-3xl font-bold text-[#1E5E4B]">Prize tiers</h2>
          {/* <p className="mt-2 text-lg text-emerald-900">
            We reward reach and relevance — verified signups only.
          </p> */}
        </div>

        {/* Prizes Grid Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Mapping over the data to render each prize card dynamically */}
          {prizeTiersData.map((tier) => (
            <div
              key={tier.category}
              className="flex flex-col justify-start rounded-2xl bg-white p-8"
            >
              <div className="mb-4">
                <span className="inline-block rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-gray-800">
                  {tier.category}
                </span>
              </div>
              <p className="mb-2 text-5xl font-extrabold text-[#1E5E4B] lg:text-6xl">
                {tier.amount}
              </p>
              {/* Conditionally render the description if it exists */}
              {tier.description && (
                <p className="mt-1 text-emerald-900">{tier.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrizeTiers;
