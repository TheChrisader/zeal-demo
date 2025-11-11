"use client";
import React from "react";

const UserProgress: React.FC = () => {
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

      <h3 className="text-2xl font-bold">Your Progress</h3>

      <p className="mt-2 text-sm opacity-80">
        Simulated progress bar — replace with real user metrics after auth.
      </p>

      <div className="mt-4">
        <div className="h-4 w-full overflow-hidden rounded-full bg-emerald-100">
          <div className="h-4 w-1/4 rounded-full bg-emerald-600 transition-all"></div>
        </div>

        <div className="mt-3 flex justify-between text-sm">
          <span>
            Entries: <strong>3</strong>
          </span>
          <span>
            Rank: <strong>—</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserProgress;
