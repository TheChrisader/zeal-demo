"use client";
import React, { useState } from "react";
import { Menu, Copy } from "lucide-react";

const ReferralPromoHero1: React.FC = () => {
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile menu button */}
            <button
              className="p-2 lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <div className="flex flex-1 items-center justify-center lg:flex-initial">
              <div className="flex items-center gap-1">
                <div className="h-6 w-6 -skew-x-12 transform bg-gradient-to-br from-orange-500 to-green-600"></div>
                <span className="text-2xl font-bold">
                  Zeal<span className="font-normal text-gray-600">News</span>
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
              <a href="#" className="text-gray-700 hover:text-gray-900">
                How it works
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900">
                Prizes
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900">
                Timeline
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900">
                Leaderboard
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900">
                FAQ
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <button className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
                Rules
              </button>
              <button className="rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
                GetLink
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {menuOpen && (
            <nav className="border-t border-gray-200 py-4 lg:hidden">
              <a href="#" className="block py-2 text-gray-700">
                How it works
              </a>
              <a href="#" className="block py-2 text-gray-700">
                Prizes
              </a>
              <a href="#" className="block py-2 text-gray-700">
                Timeline
              </a>
              <a href="#" className="block py-2 text-gray-700">
                Leaderboard
              </a>
              <a href="#" className="block py-2 text-gray-700">
                FAQ
              </a>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Hero Section */}
          <div className="relative">
            {/* Green Background Card */}
            <div className="overflow-hidden rounded-lg bg-gradient-to-br from-green-700 to-green-800">
              {/* Badge */}
              <div className="absolute left-6 top-6 z-10">
                <div className="rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                  Weekly • Share & Win
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative h-80 lg:h-96">
                <div className="absolute inset-0 flex items-center justify-end pr-8">
                  <div className="relative">
                    {/* Money bills background */}
                    <div className="absolute -left-12 -top-8 h-32 w-24 rotate-12 transform rounded-lg bg-green-500 opacity-40"></div>
                    <div className="absolute -top-4 left-4 h-28 w-20 -rotate-6 transform rounded-lg bg-green-400 opacity-50"></div>

                    {/* Person placeholder */}
                    <div className="relative h-64 w-48 rounded-t-full bg-gradient-to-b from-blue-200 to-blue-300"></div>
                  </div>
                </div>

                {/* Hero Text Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h1 className="mb-4 text-4xl font-bold leading-tight lg:text-5xl">
                    Turn your <span className="italic">influence</span>
                    <br />
                    into <span className="italic">wins.</span>
                  </h1>
                  <div className="mb-4 inline-block rounded-full bg-white px-4 py-2 text-sm font-medium text-green-800">
                    Every Friday @ 5:00 PM (WAT).
                  </div>
                  <p className="text-sm leading-relaxed lg:text-base">
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
              </div>
            </div>

            {/* Sign Up Form */}
            <div className="mt-6 space-y-4">
              <div className="inline-block rounded bg-emerald-700 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white">
                Sign Up Here
              </div>

              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />

              <input
                type="text"
                placeholder="Preferred handle (optional)"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full rounded border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />

              <button
                className="rounded bg-emerald-700 px-6 py-3 font-bold uppercase tracking-wider text-white hover:bg-emerald-800"
                onClick={() => email && alert("Link generated!")}
              >
                Get Link
              </button>

              {/* Link Preview */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Your link preview:
                </span>
                <span className="text-sm font-medium text-emerald-700">
                  {generateLink() || "https://zealnews.africa/r/your-handle"}
                </span>
                <button
                  onClick={copyLink}
                  className="ml-auto flex items-center gap-2 rounded bg-emerald-700 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white hover:bg-emerald-800"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Prize Info */}
          <div className="space-y-6">
            {/* Prize Card */}
            <div className="rounded-lg bg-green-50 p-8">
              <div className="mb-2 text-sm font-bold text-emerald-700">
                This week's prize
              </div>
              <h2 className="mb-4 text-4xl font-bold lg:text-5xl">
                ₦50,000 cash +<br />
                Branded T-Shirt
              </h2>
              <p className="text-sm text-gray-600">
                10 runner-ups: data vouchers
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Share Anywhere */}
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-3 font-bold">Share anywhere</h3>
                <p className="text-sm text-gray-600">
                  WhatsApp, X, LinkedIn, email, communities
                </p>
              </div>

              {/* Fair Tracking */}
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-3 font-bold">Fair tracking</h3>
                <p className="text-sm text-gray-600">
                  Verified signups only — no spam
                </p>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-6">
              <h3 className="mb-2 font-bold">Pro tip</h3>
              <p className="text-sm text-gray-700">
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
