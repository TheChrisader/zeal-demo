"use client";
import React, { useMemo, useState } from "react";
import { useReferralData } from "@/hooks/useReferralData";

// --- Timeline Data ---
interface TimelineItem {
  time: string;
  description: React.ReactNode;
}

const timelineItems: TimelineItem[] = [
  {
    time: "Mon – Thu",
    description:
      "Entries open 24/7. Share anytime and track your progress on the leaderboard.",
  },
  {
    time: "Fri 5:00 PM",
    description: (
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-[#FEECE9] px-2 py-1 text-sm font-medium text-[#A94442]">
          Draw time
        </span>
        <span>We select winners at random from valid entries.</span>
      </div>
    ),
  },
  {
    time: "Sat",
    description: "Winners contacted within 24 hours via email.",
  },
];

// --- Share Kit Data ---
interface ShareOption {
  platform: string;
  id: "whatsapp" | "twitter" | "linkedin" | "facebook";
  content: (referralLink: string) => React.ReactNode;
  getTextToCopy: (referralLink: string) => string;
}

const shareOptions: ShareOption[] = [
  {
    platform: "WhatsApp",
    id: "whatsapp",
    content: (referralLink) => (
      <p className="leading-relaxed text-gray-700">
        Read stories that matter. Share what you love. Get involved in
        conversations shaping Africa today. Join Zeal here:{" "}
        <span className="text-[#1E824C]">{referralLink}</span>
      </p>
    ),
    getTextToCopy: (referralLink) =>
      `I'm loving ZealNews — concise, credible Africa-first news. Join via my link and you could win this week! ${referralLink}`,
  },
  {
    platform: "X / Twitter",
    id: "twitter",
    content: (referralLink) => (
      <p className="leading-relaxed text-gray-700">
        If it’s African news that matters, it’s on Zeal. Join now so you don’t
        miss out: <span className="text-[#1E824C]">{referralLink}</span>
      </p>
    ),
    getTextToCopy: (referralLink) =>
      `Credible, concise Africa-first news via @ZealNews. Join through my link → ${referralLink} #ZealNews #ShareAndWin`,
  },
  {
    platform: "LinkedIn",
    id: "linkedin",
    content: (referralLink) => (
      <p className="leading-relaxed text-gray-700">
        Access in-depth African news, culture, tech, and lifestyle stories in
        one place. Stay informed. Join discussions. Connect with like-minded
        readers. Sign up for Zeal:{" "}
        <span className="text-[#1E824C]">{referralLink}.</span>
      </p>
    ),
    getTextToCopy: (referralLink) =>
      `If you value credible, Africa-first reporting, try ZealNews. My link: ${referralLink}. Weekly rewards for verified signups.`,
  },
  {
    platform: "Facebook",
    id: "facebook",
    content: (referralLink) => (
      <p className="leading-relaxed text-gray-700">
        Stop scrolling through headlines that don’t tell the full story. Zeal
        gives you real news, culture, and lifestyle coverage that matters. Join
        the Zeal community today:{" "}
        <span className="text-[#1E824C]">{referralLink}</span>
      </p>
    ),
    getTextToCopy: (referralLink) =>
      `Credible, concise Africa-first news via @ZealNews. Join through my link → ${referralLink} #ZealNews #ShareAndWin`,
  },
];

// SECTION: Main Component
const WeeklyTimelineShare: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { referralLink, isAuthenticated } = useReferralData();

  // Use real referral link if authenticated, otherwise use placeholder
  const displayReferralLink =
    referralLink || "https://zealnews.africa/r/your-handle";

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => {
          setCopiedId(null);
        }, 2000); // Reset feedback after 2 seconds
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  return (
    <div
      id="timeline"
      className="flex items-center justify-center px-0 py-4 font-sans sm:p-6 md:p-8"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* --- Weekly Timeline Section --- */}
        <section>
          <h1 className="mb-8 text-3xl font-bold text-[#1E824C] md:text-4xl">
            Weekly timeline (WAT)
          </h1>
          <div className="space-y-4">
            {timelineItems.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-x-1 gap-y-2 sm:flex-row sm:items-center"
              >
                <p className="w-full font-bold text-gray-900 sm:w-28 sm:shrink-0 sm:text-left">
                  {item.time}
                </p>
                <div className="w-full rounded-lg border border-dashed border-green-600 bg-white px-4 py-1.5 text-gray-700">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
          <button className="grow-shrink mx-auto mt-8 flex w-fit rounded-md bg-red-600 px-10 py-3 font-bold text-white transition-colors hover:bg-[#16643B]">
            Join now
          </button>
        </section>

        {/* --- Share Kit Section --- */}
        <section>
          <div className="h-full rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Share kit (one-click copy)
              </h2>
              {!isAuthenticated && (
                <span className="text-xs text-gray-500">
                  Sign in to use your referral link
                </span>
              )}
            </div>
            <div className="space-y-6">
              {shareOptions.map((option) => {
                const textToCopy = option.getTextToCopy(displayReferralLink);
                return (
                  <div
                    key={option.id}
                    className="space-y-2 rounded-lg border border-dashed border-green-800 p-4"
                  >
                    <h3 className="font-bold text-gray-900">
                      {option.platform}
                    </h3>
                    {option.content(displayReferralLink)}
                    <button
                      onClick={() => handleCopy(textToCopy, option.id)}
                      className={`rounded-md px-5 py-1.5 text-sm font-medium transition-all duration-200 ease-in-out ${
                        copiedId === option.id
                          ? "bg-green-600 text-white"
                          : "bg-[#FEECE9] text-[#A94442] hover:bg-[#FCDAD6]"
                      }`}
                    >
                      {copiedId === option.id ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WeeklyTimelineShare;
