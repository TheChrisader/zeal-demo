"use client";
import React from "react";

const HowItWorksCard: React.FC = () => {
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
      `}</style>

      <h3 className="text-2xl font-bold">How it works</h3>

      <ol className="mt-4 space-y-4 text-sm">
        <li className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
            1
          </div>
          <div>
            <div className="font-semibold">Get your link</div>
            <div className="opacity-80">
              Generate a personal referral URL you can share.
            </div>
          </div>
        </li>

        <li className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
            2
          </div>
          <div>
            <div className="font-semibold">Share</div>
            <div className="opacity-80">
              Post on WhatsApp/X/LinkedIn or email.
            </div>
          </div>
        </li>

        <li className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
            3
          </div>
          <div>
            <div className="font-semibold">Track</div>
            <div className="opacity-80">
              View verified signups and your leaderboard rank.
            </div>
          </div>
        </li>
      </ol>

      <div className="mt-6">
        <a
          href="#leaderboard"
          className="inline-block rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:scale-105"
        >
          See Leaderboard
        </a>
      </div>
    </div>
  );
};

export default HowItWorksCard;
