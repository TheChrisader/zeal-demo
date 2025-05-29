export const getWordCount = (content: string): number => {
  return content.split(/\s+/).filter(Boolean).length;
};
