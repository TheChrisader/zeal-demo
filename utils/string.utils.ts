import isEnglish from "is-english";

export const stripExtraWhitespace = (str: string) => {
  return str.replace(/\s+/g, " ").trim();
};

export function removeCharacters(str: string, charsToRemove: string[]) {
  const regex = new RegExp(`[${charsToRemove.join("")}]`, "g");
  return str.replace(regex, "");
}

export const isTextEnglish = (str: string) => {
  if (
    isEnglish(
      removeCharacters(str, [
        "‘",
        "’",
        "…",
        "₦",
        "—",
        "™",
        "“",
        "”",
        "|",
        "★",
        "☆",
      ]),
    )
  ) {
    return true;
  }

  return false;
};

export function truncateString(str?: string, num = 91) {
  if (!str) return str;

  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}
