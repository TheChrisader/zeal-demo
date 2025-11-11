"use client";
import React from "react";

const InfographicGuide: React.FC = () => {
  return (
    <section
      id="infographic-guide"
      className="reveal mx-auto mt-20 max-w-6xl px-6"
    >
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

      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold text-emerald-700 md:text-4xl">
          Infographic Guide
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Understand the referral process at a glance — quick, simple, and
          rewarding.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Step 1: Sign Up */}
        <div className="reveal flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-md">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            {/* Icon: User Add */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold">Sign Up</h3>

          <p className="mt-2 text-sm opacity-80">
            Create your ZealNews account and get your referral link instantly.
          </p>
        </div>

        {/* Step 2: Share Widely */}
        <div className="reveal flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-md">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            {/* Icon: Share */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4m0 0L8 6m4-4v16"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold">Share Widely</h3>

          <p className="mt-2 text-sm opacity-80">
            Post your link on social media and invite your network to join.
          </p>
        </div>

        {/* Step 3: Verify Signups */}
        <div className="reveal flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-md">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            {/* Icon: Check Circle */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold">Verify Signups</h3>

          <p className="mt-2 text-sm opacity-80">
            Each successful registration through your link earns you verified
            points.
          </p>
        </div>

        {/* Step 4: Earn Rewards */}
        <div className="reveal flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-md">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            {/* Icon: Trophy */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-emerald-600"
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

          <h3 className="text-lg font-semibold">Earn Rewards</h3>

          <p className="mt-2 text-sm opacity-80">
            Top referrers are rewarded weekly — build influence, earn prizes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default InfographicGuide;
