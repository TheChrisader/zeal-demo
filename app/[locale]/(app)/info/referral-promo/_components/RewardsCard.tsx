"use client";
import React from "react";

const RewardsCard: React.FC = () => {
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
      `}</style>

      <h3 className="text-2xl font-bold">Rewards</h3>

      <p className="mt-3 text-sm opacity-90">
        We reward reach and relevance — verified signups only.
      </p>

      <div className="mt-4 grid gap-3">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="text-2xl font-extrabold">₦50,000</div>
          <div className="text-sm opacity-80">
            Grand Prize + Branded T-Shirt
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
          <div>
            <div className="font-bold">₦30,000</div>
            <div className="text-xs opacity-80">1st Runner-up</div>
          </div>
          <div className="text-xs opacity-60">Weekly</div>
        </div>
      </div>
    </div>
  );
};

export default RewardsCard;
