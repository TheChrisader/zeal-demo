export const CATEGORIES = [
  "business",
  "crime",
  "domestic",
  "education",
  "entertainment",
  "environment",
  "food",
  "health",
  "lifestyle",
  "other",
  "politics",
  "science",
  "sports",
  "technology",
  "top",
  "tourism",
  "world",
] as const;

export const Categories = CATEGORIES.map(
  (category) => category.charAt(0).toUpperCase() + category.slice(1),
);

export type TCategory = (typeof CATEGORIES)[number];
