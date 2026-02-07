"use client";
import { Check, Copy, Menu } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useReferral } from "@/hooks/useReferral";
import { Link } from "@/i18n/routing";
import { useRouter } from "@/app/_components/useRouter";

const ReferralPromoHero1: React.FC = () => {
  const [referralLink, setReferralLink] = useState("");
  const [copyButtonText, setCopyButtonText] = useState("Copy");
  const { referralCode: urlReferralCode } = useReferral();
  const router = useRouter();

  const handleGetLink = () => {
    const params = new URLSearchParams({
      promo: "true",
      ...(urlReferralCode && { ref: urlReferralCode }),
    });
    router.push(`/signup?${params.toString()}`);
  };

  const copyLink = async () => {
    const linkToCopy = referralLink || generateLink();

    if (!linkToCopy || linkToCopy.includes("your-handle")) {
      toast.error("Please generate your link first");
      return;
    }

    try {
      await navigator.clipboard.writeText(linkToCopy);
      setCopyButtonText("Copied!");
      setTimeout(() => setCopyButtonText("Copy"), 2000);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const generateLink = () => {
    return `https://zealnews.africa/en?ref=${urlReferralCode || "your-code"}`;
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

              <button
                className="grow-shrink mx-auto flex w-fit items-center gap-2 rounded bg-red-600 px-6 py-1 font-bold uppercase tracking-wider text-white hover:bg-emerald-800"
                onClick={handleGetLink}
              >
                Get Link
              </button>

              {/* Terms Link */}
              <p className="text-center text-xs text-gray-600">
                By signing up, you agree to our{" "}
                <Link
                  href="/info/referral-promo/terms-and-conditions"
                  className="text-emerald-700 underline hover:text-emerald-900"
                >
                  Terms & Conditions
                </Link>
              </p>
            </div>
          </div>

          {/* Right Column - Prize Info */}
          <div className="space-y-6 rounded-lg bg-white p-4 text-black/80">
            {/* Prize Card */}
            <div className="rounded-lg bg-green-50 p-4">
              <div className="grow-shrink mb-2 flex w-fit text-sm font-bold text-emerald-800">
                Star Prize
              </div>
              <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
                ₦50,000 cash price plus an exclusive Zeal-branded T-shirt
              </h2>
              <p className="text-sm text-emerald-800">
                10 runner-ups: data vouchers
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Share Anywhere */}
              {/* <div className="rounded-lg border border-gray-200 bg-green-50/50 p-6">
                <h3 className="mb-1 font-bold">Share anywhere</h3>
                <p className="text-sm text-emerald-800">
                  WhatsApp, X, LinkedIn, email, communities
                </p>
              </div> */}
              <div className="p-6 sm:p-16">
                <img src="/zeal_logo_2.svg" className="size-20 sm:size-auto" />
              </div>

              {/* Fair Tracking */}
              <div className="rounded-lg border border-gray-200 bg-green-50/50 p-6">
                <h3 className="mb-1 font-bold">
                  Transparent and reliable tracking
                </h3>
                <p className="text-sm text-emerald-800">
                  We count only verified sign-ups to ensure fairness, accuracy,
                  and a spam-free experience for everyone involved.
                </p>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="rounded-lg border border-gray-200 bg-green-50/50 p-6">
              <h3 className="mb-1 font-bold">
                Include a brief personal message when sharing. It drives two to
                three times more engagement than posting a link alone.{" "}
              </h3>
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
