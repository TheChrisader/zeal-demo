export interface Promotion {
  title: string;
  description: string;
  subheading: string;
  statement: string;
  quote: string;
  imagePath: string;
}

export const PROMOTION_KEYS = [
  "Culture",
  "Diaspora Connect",
  "History",
  "Latest Tech News",
  "Social Insight",
] as const satisfies string[];

export type PROMOTION_DETAIL_KEY_ENUMS = (typeof PROMOTION_KEYS)[number];

export const IMAGE_TYPE = {
  D_120x600: "Desktop View (120x600).png",
  D_160x600: "Desktop View (160 x 600).png",
  D_250x250: "Desktop View (250x250).png",
  D_300x600: "Desktop View (300 x 600).png",
  D_300x250: "Desktop View (300x250).png",
  D_336x280: "Desktop View (336x280).png",
  D_728x90: "Desktop View (728x90).png",
  D_970x90: "Desktop View (970 x 90).png",
  D_970x250: "Desktop View (970x250).png",
  M_320x50: "Mobile View (320X50).png",
  M_300x600: "Mobile Views (300X600).png",
  M_320x100: "Mobile Views (320X100).png",
  M_300x250: "Mobile Views (300X250).png",
  M_320x480: "Mobile Views (320X480).png",
};

export const PROMOTION_DETAIL_MAP: Record<
  PROMOTION_DETAIL_KEY_ENUMS,
  Promotion
> = {
  Culture: {
    title: "Culture",
    description:
      "Explore untold stories, vibrant traditions, and the heart of African heritage in every edition.",
    subheading: "Read Between the Lines of African Society",
    statement: "Your Gateway to Africa's Untold Cultural Narratives.",
    quote: "Culture isn't just history. It's the rhythm of who we are.",
    imagePath: "/ads/culture",
  },
  "Diaspora Connect": {
    title: "Diaspora Connect",
    description:
      "Bridging borders through stories, achievements, and voices of Africans around the world.",
    subheading: "Stay Connected to Home",
    statement: "From Lagos to London, Accra to Atlanta - We Cover It All.",
    quote: "No matter the distance, your roots still run deep.",
    imagePath: "/ads/diaspora-connect",
  },
  History: {
    title: "History",
    description:
      "Discover the echoes of Africa's past events, people, and eras that shaped the continent.",
    subheading: "Rewind the Stories that Made Africa, Africa",
    statement: "A Journey Through Time, Narrated with Insight.",
    quote:
      "To understand the present, we must walk through the footsteps of the past.",
    imagePath: "/ads/history",
  },
  "Latest Tech News": {
    title: "Latest Tech News",
    description:
      "Stay ahead with emerging tech trends, innovations, and expert insights across Africa.",
    subheading: "Decode Africa's Digital Transformation",
    statement: "From Startups to Fintech Hubs - We Cover It All.",
    quote:
      "The future isn't coming. It's already here, just not evenly distributed.",
    imagePath: "/ads/latest-tech-news",
  },
  "Social Insight": {
    title: "Social Insight",
    description:
      "Unveil perspectives, probe patterns, and understand the pulse of African society.",
    subheading: "Navigate the Rhythms of African Communities",
    statement: "Bold Conversations. Real Impact. True Narratives.",
    quote: "Society speaks in whispers and in echoes, are you listening?",
    imagePath: "/ads/social-insight",
  },
};
