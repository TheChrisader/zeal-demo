export const WRITER_DISTRIBUTION: Record<string, string[]> = {
  Local: ["Pelumi Ilesanmi"],
  "Across Africa": ["Pelumi Ilesanmi"],
  Global: ["Pelumi Ilesanmi"],
  Politics: ["Pelumi Ilesanmi"],
  Climate: ["Pelumi Ilesanmi"],
  Opinion: ["Owobu Maureen", "Ebasa Joseph", "Florence Idimone"],
  Startup: ["Ibukun Oluwa", "David Isong"],
  "Economy/Finance": ["Ibukun Oluwa"],
  Crypto: ["David Isong"],
  Career: ["Ibukun Oluwa"],
  "Latest Tech News": ["Uche Emeka"],
  AI: ["Uche Emeka"],
  Fintech: ["Uche Emeka", "David Isong"],
  "Social Insight": ["Owobu Maureen", "Florence Idimone", "Pelumi Ilesanmi"],
  Culture: ["Owobu Maureen", "Florence Idimone", "Pelumi Ilesanmi"],
  History: ["Owobu Maureen", "Florence Idimone", "Pelumi Ilesanmi"],
  "Diaspora Connect": ["Owobu Maureen", "Florence Idimone", "Pelumi Ilesanmi"],
  Science: ["Owobu Maureen", "Florence Idimone", "Pelumi Ilesanmi"],
  Health: ["Ibukun Oluwa", "Precious Eseaye"],
  Food: ["Ibukun Oluwa", "Precious Eseaye"],
  Travel: ["Ibukun Oluwa", "Precious Eseaye"],
  Parenting: ["Ibukun Oluwa", "Precious Eseaye"],
  Fashion: ["Ibukun Oluwa", "Precious Eseaye"],
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
