export const COUNTRIES = {
  Nigeria: "ng",
  India: "in",
  Germany: "de",
  Canada: "ca",
} as const;

export type ICountries = (keyof typeof COUNTRIES)[];

export type ICountry = keyof typeof COUNTRIES;
