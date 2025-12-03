"use client";
import React, { useState } from "react";
import { Menu, Copy } from "lucide-react";

const ReferralPromoHero1: React.FC = () => {
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");

  const generateLink = () => {
    if (email) {
      return `https://zealnews.africa/r/${handle || "your-handle"}`;
    }
    return "";
  };

  const copyLink = () => {
    const link = generateLink();
    if (link) {
      navigator.clipboard.writeText(link);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="mx-auto max-w-7xl py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Hero Section */}
          <div className="relative">
            {/* Green Background Card */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-green-700 to-green-800 px-4 py-10">
              {/* Badge */}
              <div className="z-10">
                <div className="w-fit rounded-full bg-white px-4 py-1 text-xs font-bold uppercase tracking-wider">
                  Weekly • Share & Win
                </div>
              </div>

              {/* Hero Image */}
              <div className="">
                {/* <div className="absolute inset-0 flex items-center justify-end pr-8"> */}
                {/* <div className="relative"> */}
                {/* Money bills background */}
                <img
                  src="/referral/money_foreground.webp"
                  className="absolute left-0 top-0 size-full"
                ></img>
                <img
                  src="/referral/money_background.webp"
                  className="absolute left-0 top-0 size-full opacity-30"
                ></img>

                {/* Person placeholder */}
                {/* <div className="relative h-64 w-48 rounded-t-full bg-gradient-to-b from-blue-200 to-blue-300"></div> */}

                {/* </div> */}
                {/* </div> */}

                {/* Hero Text Overlay */}
                <div className="relative z-10 text-left text-white">
                  <h1 className="mb-4 text-2xl font-bold leading-tight lg:text-3xl">
                    Turn your <span className="italic">influence</span>
                    <br />
                    into <span className="italic">wins.</span>
                  </h1>
                  <div className="mb-4 inline-block rounded-full bg-white/50 px-4 py-1 text-sm font-bold text-black">
                    Every Friday @ 5:00 PM (WAT).
                  </div>
                  <p className="lg:sm text-sm leading-relaxed">
                    Invite friends to a smarter, Africa-first news
                    <br />
                    brief. Each{" "}
                    <span className="font-semibold text-yellow-300">
                      verified signup
                    </span>{" "}
                    via your link earns
                    <br />
                    <span className="font-semibold text-yellow-300">
                      entries.
                    </span>{" "}
                    More entries, better odds.
                  </p>
                </div>
                <img
                  src="/referral/girl_smiling_2.webp"
                  className="absolute -right-12 bottom-0 z-[1] h-60"
                />
                <img
                  src="/referral/guy_smiling.webp"
                  className="absolute -right-40 bottom-0 z-0 h-72"
                />
              </div>
            </div>

            {/* Sign Up Form */}
            <div className="mt-2 space-y-2">
              <div className="grow-shrink mx-auto flex w-fit rounded bg-red-600 px-4 py-1 text-sm font-bold uppercase tracking-wider text-white">
                Sign Up Here
              </div>

              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-gray-300 px-4 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />

              <input
                type="text"
                placeholder="Preferred handle (optional)"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full rounded border border-gray-300 px-4 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />

              <button
                className="grow-shrink mx-auto flex w-fit rounded bg-red-600 px-6 py-1 font-bold uppercase tracking-wider text-white hover:bg-emerald-800"
                onClick={() => email && alert("Link generated!")}
              >
                Get Link
              </button>

              {/* Link Preview */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Your link preview:
                  </span>
                  <span className="text-sm font-medium text-emerald-700">
                    {generateLink() || "https://zealnews.africa/r/your-handle"}
                  </span>
                </div>
                <div className="flex w-full items-center justify-center sm:w-fit">
                  <button
                    onClick={copyLink}
                    className="grow-shrink flex items-center gap-2 rounded bg-red-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-800"
                  >
                    <Copy className="size-2" />
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Prize Info */}
          <div className="space-y-6 rounded-lg bg-white p-4">
            {/* Prize Card */}
            <div className="rounded-lg bg-green-50 p-4">
              <div className="grow-shrink mb-2 flex w-fit text-sm font-bold text-emerald-800">
                This week's prize
              </div>
              <h2 className="mb-4 text-4xl font-bold lg:text-5xl">
                ₦50,000 cash +<br />
                Branded T-Shirt
              </h2>
              <p className="text-sm text-emerald-800">
                10 runner-ups: data vouchers
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Share Anywhere */}
              <div className="rounded-lg border border-gray-200 bg-green-50/50 p-6">
                <h3 className="mb-1 font-bold">Share anywhere</h3>
                <p className="text-sm text-emerald-800">
                  WhatsApp, X, LinkedIn, email, communities
                </p>
              </div>

              {/* Fair Tracking */}
              <div className="rounded-lg border border-gray-200 bg-green-50/50 p-6">
                <h3 className="mb-1 font-bold">Fair tracking</h3>
                <p className="text-sm text-emerald-800">
                  Verified signups only — no spam
                </p>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="rounded-lg border border-gray-200 bg-green-50/50 p-6">
              <h3 className="mb-1 font-bold">Pro tip</h3>
              <p className="text-sm text-emerald-800">
                Add a short personal note when you share — converts 2–3× better
                than bare links.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReferralPromoHero1;
