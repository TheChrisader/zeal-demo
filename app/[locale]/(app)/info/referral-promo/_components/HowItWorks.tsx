"use client";
import type { FC } from "react";

// SECTION: SVG Icons
// These are custom SVG components to match the icons in the design.

const GetLinkIcon: FC = () => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_101_2)">
      <path
        d="M30 37.5C34.1421 37.5 37.5 34.1421 37.5 30C37.5 25.8579 34.1421 22.5 30 22.5C25.8579 22.5 22.5 25.8579 22.5 30C22.5 34.1421 25.8579 37.5 30 37.5Z"
        stroke="#FBBF24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M45 15C49.1421 15 52.5 18.3579 52.5 22.5C52.5 26.6421 49.1421 30 45 30H37.5"
        stroke="#FBBF24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 45C10.8579 45 7.5 41.6421 7.5 37.5C7.5 33.3579 10.8579 30 15 30H22.5"
        stroke="#FBBF24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M45 30H50V40C50 42.6522 48.9464 45.1957 47.0711 47.0711C45.1957 48.9464 42.6522 50 40 50H20C17.3478 50 14.8043 48.9464 12.9289 47.0711C11.0536 45.1957 10 42.6522 10 40V30H15"
        stroke="#4A5568"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50 30L30 42.5L10 30"
        stroke="#4A5568"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_101_2">
        <rect width="60" height="60" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const ShareAnywhereIcon: FC = () => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="20"
      y="5"
      width="28"
      height="50"
      rx="4"
      stroke="#4A5568"
      strokeWidth="2"
    />
    <circle cx="9" cy="20" r="4" fill="#25D366" />
    <circle cx="51" cy="15" r="4" fill="#000000" />
    <circle cx="53" cy="35" r="6" fill="#0A66C2" />
    <path
      d="M25 10H43"
      stroke="#4A5568"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const EarnEntriesIcon: FC = () => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M50 22.5C50 20.3783 49.1571 18.3434 47.6569 16.8431C46.1566 15.3429 44.1217 14.5 42 14.5C39.8783 14.5 37.8434 15.3429 36.3431 16.8431C34.8429 18.3434 34 20.3783 34 22.5"
      stroke="#34D399"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 45.5C18 43.3783 17.1571 41.3434 15.6569 39.8431C14.1566 38.3429 12.1217 37.5 10 37.5C7.87827 37.5 5.84344 38.3429 4.34315 39.8431C2.84285 41.3434 2 43.3783 2 45.5"
      stroke="#34D399"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M42 37.5C44.1217 37.5 46.1566 38.3429 47.6569 39.8431C49.1571 41.3434 50 43.3783 50 45.5"
      stroke="#34D399"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 14.5C12.1217 14.5 14.1566 15.3429 15.6569 16.8431C17.1571 18.3434 18 20.3783 18 22.5"
      stroke="#34D399"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 22.5H34"
      stroke="#34D399"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 45.5H34"
      stroke="#34D399"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M25 34L18 45.5"
      stroke="#34D399"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="28"
      y="42"
      width="30"
      height="16"
      rx="2"
      fill="white"
      stroke="#4A5568"
      strokeWidth="2"
    />
    <path
      d="M28 48H58"
      stroke="#4A5568"
      strokeWidth="2"
      strokeDasharray="4 4"
    />
    <text
      x="43"
      y="52"
      textAnchor="middle"
      fontSize="8"
      fill="#4A5568"
      fontWeight="bold"
    >
      TICKET
    </text>
  </svg>
);

const WinWeeklyIcon: FC = () => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M45 25C45 36.0457 36.0457 45 25 45C13.9543 45 5 36.0457 5 25C5 13.9543 13.9543 5 25 5C36.0457 5 45 13.9543 45 25Z"
      fill="#FBBF24"
      fillOpacity="0.2"
    />
    <path
      d="M30 15H20C18.6739 15 17.4021 15.5268 16.4645 16.4645C15.5268 17.4021 15 18.6739 15 20V40C15 41.3261 15.5268 42.5979 16.4645 43.5355C17.4021 44.4732 18.6739 45 20 45H30"
      stroke="#FBBF24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M42.5 15V45"
      stroke="#FBBF24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M55 22.5V37.5"
      stroke="#FBBF24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M22.5 5H27.5V10H22.5V5Z" fill="#FBBF24" />
    <path
      d="M25 45V27.5C25 25.567 26.567 24 28.5 24H35C38.3137 24 41 26.6863 41 30C41 33.3137 38.3137 36 35 36H25"
      stroke="#FBBF24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlayIcon: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="ml-1 size-10 text-white"
  >
    <path
      fillRule="evenodd"
      d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.748 1.295 2.538 0 3.286L7.279 20.99c-1.25.72-2.779-.217-2.779-1.643V5.653z"
      clipRule="evenodd"
    />
  </svg>
);

// SECTION: Data for the steps
const stepsData = [
  {
    id: 1,
    title: "Get your link",
    description:
      "Sign up as a user on the Zeal official website and for the affiliate program with your email to get your referral link.",
    icon: GetLinkIcon,
  },
  {
    id: 2,
    title: "Share anywhere",
    description:
      "WhatsApp, X, LinkedIn, communities. Add a one-liner on why ZealNews is worth it.",
    icon: ShareAnywhereIcon,
  },
  {
    id: 3,
    title: "Earn entries",
    description:
      "Every verified newsletter signup via your link adds entries into Friday's draw.",
    icon: EarnEntriesIcon,
  },
  {
    id: 4,
    title: "Win weekly",
    description:
      "Winners are announced at the end of every week and notified within 24 hours.",
    icon: WinWeeklyIcon,
  },
];

// SECTION: Main Component
const HowItWorks: FC = () => {
  return (
    <div id="how-it-works" className="px-4 py-2 font-sans sm:py-4">
      <div className="mx-auto max-w-7xl">
        {/* Main Content Layout */}
        <main className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
          {/* Left Column: How it Works Steps */}
          <div className="flex w-full flex-col items-center">
            {/* Header */}
            <header className="mb-2 text-center">
              <h1 className="text-3xl font-bold text-[#1E4D2B] sm:text-3xl">
                How it Works
              </h1>
              {/* <p className="mt-1 text-lg text-[#1E4D2B] sm:text-lg">
                Four simple steps – built to be fair, fast, and fun.
              </p> */}
            </header>

            <div className="w-full rounded-3xl border border-emerald-800 p-2 sm:p-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                {stepsData.map((step) => (
                  <div key={step.id}>
                    <div className="flex items-start justify-between rounded-lg bg-white p-4">
                      <div className="flex flex-col">
                        <span className="mb-3 flex size-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                          {step.id}
                        </span>
                        <div className="mb-2 flex items-center">
                          <div>
                            <h3 className="text-base font-bold text-[#1E4D2B]">
                              {step.title}
                            </h3>
                            <p className="pr-2 text-xs text-emerald-900">
                              {step.description}
                            </p>
                          </div>
                          <div className="ml-2 shrink-0">
                            <step.icon />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action Button 1 */}
            <button className="mt-4 rounded-xl bg-red-600 px-4 py-1 text-lg font-bold text-white shadow-md transition-colors duration-300 hover:bg-[#15381f]">
              Start Sharing. Start Winning.
            </button>
            <button className="grow-shrink mt-4 rounded-xl bg-red-600 px-8 py-1 text-lg font-bold text-white shadow-md transition-colors hover:bg-[#15381f]">
              Join Now!
            </button>
          </div>

          {/* Right Column: Video Preview */}
          <div className="flex w-full flex-col items-center">
            <div className="w-full rounded-3xl border border-green-200/50 bg-white p-3 sm:p-4">
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gray-100">
                <video
                  src="https://d3hovs1ug0rvor.cloudfront.net/videos/referral_promo.mp4"
                  poster="/referral/referral-promo-video.png"
                  title="Share & Win ₦50,000 – ZealNews Africa Contest"
                  controls
                  preload="metadata"
                  playsInline
                  className="size-full object-cover"
                />
              </div>
            </div>

            {/* Call to Action Button 2 */}
            <button className="sm:-lg mt-8 rounded-xl bg-red-600 px-3 py-1 text-center text-sm font-bold text-white shadow-md transition-colors duration-300 hover:bg-[#15381f]">
              <span>Get your referral link today</span> – your first
              <br />
              entry could win this Friday!
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HowItWorks;
