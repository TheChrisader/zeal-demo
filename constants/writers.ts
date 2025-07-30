export const WRITER_DISTRIBUTION: Record<string, string[]> = {
  Local: ["Pelumi Ilesanmi"],
  "Across Africa": ["Pelumi Ilesanmi"],
  Global: ["Pelumi Ilesanmi"],
  Politics: ["Pelumi Ilesanmi"],
  Climate: ["Pelumi Ilesanmi"],
  Opinion: ["Ebasa Joseph", "Florence Idimone"],
  Startup: ["David Isong"],
  "Economy/Finance": [],
  Crypto: ["David Isong"],
  Career: [],
  "Latest Tech News": ["Uche Emeka"],
  AI: ["Uche Emeka"],
  Fintech: ["Uche Emeka", "David Isong"],
  "Social Insight": ["Florence Idimone", "Pelumi Ilesanmi"],
  Culture: ["Florence Idimone", "Pelumi Ilesanmi"],
  History: ["Florence Idimone", "Pelumi Ilesanmi"],
  "Diaspora Connect": ["Florence Idimone", "Pelumi Ilesanmi"],
  Science: ["Florence Idimone", "Pelumi Ilesanmi"],
  Health: ["Precious Eseaye"],
  Food: ["Precious Eseaye"],
  Travel: ["Precious Eseaye"],
  Parenting: ["Precious Eseaye"],
  Fashion: ["Precious Eseaye"],
  "Celebrity News": ["Precious Eseaye"],
  Profiles: ["Precious Eseaye"],
  Music: ["Precious Eseaye"],
  Movies: ["Precious Eseaye"],
  Sports: ["Uche Emeka", "Precious Eseaye"],
};

export const getCategoriesByWriter = (writer: string) => {
  return Object.keys(WRITER_DISTRIBUTION).filter((category) =>
    WRITER_DISTRIBUTION[category]?.includes(writer),
  );
};
