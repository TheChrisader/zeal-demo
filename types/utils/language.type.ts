// export const Languages = ["en", "fr"] as const;

export const Languages = {
  English: "en",
  French: "fr",
} as const;

// export type Language = (typeof Languages)[keyof typeof Languages];

export type Language = keyof typeof Languages;
