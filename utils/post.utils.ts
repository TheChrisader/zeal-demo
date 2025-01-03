export const TOKENS = [
  ["<ul", "</ul>"],
  ["<ol", "</ol>"],
  ["<li", "</li>"],
  ["<h2", "</h2>"],
  ["<h3", "</h3>"],
  ["<a", "</a>"],
  ["<strong", "</strong>"],
  ["<header", "</header>"],
];

export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 210;

  const wordCount = content.replace(/<[^>]+>/g, " ").split(/\s+/).length;

  const textReadingTime = Math.ceil(wordCount / wordsPerMinute);

  const mediaTypes: Record<string, number> = {
    image: 3,
    video: 120,
  };

  let totalMediaTime = 0;

  Object.keys(mediaTypes).forEach((mediaType) => {
    const mediaCount = (content.match(new RegExp(`<${mediaType}`, "gi")) || [])
      .length;
    totalMediaTime += mediaCount * mediaTypes[mediaType]!;
  });

  const mediaReadingTime = Math.ceil(totalMediaTime / 60);

  const totalReadingTime = textReadingTime + mediaReadingTime;

  return totalReadingTime;
};

export const fixImgSrcset = (string: string) => {
  return string
    .replace(/<img/g, "<img loading='lazy'")
    .replace(/data-srcset/g, "srcset");
};

export const replaceLinksWithSpan = (string: string) => {
  return string.replace(/<a[^>]*>/g, "<span>").replace(/<\/a>/g, "</span>");
};

export const deletePortion = (string: string, start: string, end: string) => {
  const startIndex = string.indexOf(start);
  const endIndex = string.indexOf(end, startIndex + start.length);

  if (startIndex === -1 || endIndex === -1) {
    return string;
  }

  const cutContent = string.slice(startIndex, endIndex + end.length);

  if (start === "<a" && !cutContent.includes("img")) {
    return string;
  }

  return string.slice(0, startIndex) + string.slice(endIndex + end.length);
};

export const cleanContent = (
  content: string,
  tokensList: string[][] = TOKENS,
) => {
  let i = 0;
  let startPosition = 0,
    endPosition = 0;
  let tokens;

  while (i < tokensList.length) {
    tokens = tokensList[i];

    const startIndex = content.indexOf(tokens?.[0] as string, startPosition);
    const endIndex = content.indexOf(tokens?.[1] as string, endPosition);

    if (startIndex !== -1 && endIndex !== -1) {
      content = deletePortion(
        content,
        tokens?.[0] as string,
        tokens?.[1] as string,
      );

      startPosition = startIndex + (tokens?.[0] as string).length;
      endPosition = endIndex + (tokens?.[1] as string).length;
    } else {
      i++;
      startPosition = 0;
      endPosition = 0;
    }
  }

  content = /* replaceLinksWithSpan( */ fixImgSrcset(content) /* ) */;

  return content;
};
