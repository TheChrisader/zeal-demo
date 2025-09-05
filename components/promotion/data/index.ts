export interface Promotion {
  title: string;
  description: string;
  subheading: string;
  statement: string;
  quote: string;
  image: string;
}

export const PROMOTION_KEYS = [
  "Culture",
  "Diaspora Connect",
  "History",
  "Latest Tech News",
  "Social Insight",
] as const satisfies string[];

export type PROMOTION_DETAIL_KEY_ENUMS = (typeof PROMOTION_KEYS)[number];

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
    image: "/culture.png",
  },
  "Diaspora Connect": {
    title: "Diaspora Connect",
    description:
      "Bridging borders through stories, achievements, and voices of Africans around the world.",
    subheading: "Stay Connected to Home",
    statement: "From Lagos to London, Accra to Atlanta - We Cover It All.",
    quote: "No matter the distance, your roots still run deep.",
    image: "/diaspora-connect.png",
  },
  History: {
    title: "History",
    description:
      "Discover the echoes of Africa's past events, people, and eras that shaped the continent.",
    subheading: "Rewind the Stories that Made Africa, Africa",
    statement: "A Journey Through Time, Narrated with Insight.",
    quote:
      "To understand the present, we must walk through the footsteps of the past.",
    image: "/history.png",
  },
  "Latest Tech News": {
    title: "Latest Tech News",
    description:
      "Stay ahead with emerging tech trends, innovations, and expert insights across Africa.",
    subheading: "Decode Africa's Digital Transformation",
    statement: "From Startups to Fintech Hubs - We Cover It All.",
    quote:
      "The future isn't coming. It's already here, just not evenly distributed.",
    image: "/latest-tech-news.png",
  },
  "Social Insight": {
    title: "Social Insight",
    description:
      "Unveil perspectives, probe patterns, and understand the pulse of African society.",
    subheading: "Navigate the Rhythms of African Communities",
    statement: "Bold Conversations. Real Impact. True Narratives.",
    quote: "Society speaks in whispers and in echoes, are you listening?",
    image: "/social-insight.png",
  },
};
