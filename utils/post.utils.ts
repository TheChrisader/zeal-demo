type ParserConfig = Record<
  string,
  {
    excludeTokens?: string[][];
    specialTokens?: string[][];
    removeKeywords?: string[];
  }
>;

export const parserConfig: ParserConfig = {
  "dailytrust.com": {
    excludeTokens: [["<strong", "</strong>"]],
    removeKeywords: ["SPONSOR AD"],
  },
  "thenationonlineng.net": {
    removeKeywords: ["News"],
  },
  "www.premiumtimesng.com": {
    excludeTokens: [["<strong", "</strong>"]],
    specialTokens: [
      ['<div id="membershipOverlay"', "</div>"],
      ['<a href="#"', "</a>"],
      ['<a href="https://www.premiumtimesng.com/support"', "</a>"],
      ['<a rel="noopener" href="https://premiumtimes.ecwid.com/"', "</a>"],
      ["<hr", ">"],
    ],
    removeKeywords: [
      "At&nbsp;Premium Times, we firmly believe in the importance of high-quality journalism. Recognizing that not everyone can afford costly news subscriptions, we are dedicated to delivering meticulously researched, fact-checked news that remains freely accessible to all.",
      "Whether you turn to Premium Times for daily updates, in-depth investigations into pressing national issues, or entertaining trending stories, we value your readership.",
      "It’s essential to acknowledge that news production incurs expenses, and we take pride in never placing our stories behind a prohibitive paywall.",
      "Would you consider supporting us with a modest contribution on a monthly basis&nbsp;to help maintain our commitment to free, accessible news?&nbsp;",
      "TEXT AD:",
    ],
  },
  "www.legit.ng": {
    excludeTokens: [["<strong", "</strong>"]],
  },
  "guardian.ng": {
    specialTokens: [
      ['<div data-base-category="46751">', "</div> </div>"],
      ['<div data-base-category="46751">', "</div></div>"],
    ],
  },
};

const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const removeFilterString = (html: string, filter: string): string => {
  if (filter === "") {
    return html;
  }
  const escapedFilter = escapeRegExp(filter);
  const pattern = `<(\\w+)(\\s+[^>]*)?>\\s*${escapedFilter}\\s*<\\/\\1>`;
  const regex = new RegExp(pattern, "g");
  let previousHtml;
  do {
    previousHtml = html;
    html = html.replace(regex, "");
  } while (html !== previousHtml);
  return html;
};

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

function filterTokens(source: string[][], filter: string[][]): string[][] {
  const filterSet = new Set(filter.map((arr) => JSON.stringify(arr)));
  return source.filter((arr) => !filterSet.has(JSON.stringify(arr)));
}

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
  source: string,
  tokensList: string[][] = filterTokens(
    TOKENS,
    parserConfig[source]?.excludeTokens || [],
  ).concat(parserConfig[source]?.specialTokens || []),
) => {
  let i = 0;
  let startPosition = 0,
    endPosition = 0;
  let tokens;
  // console.log(source);

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

  parserConfig[source]?.removeKeywords?.forEach((keyword) => {
    content = removeFilterString(content, keyword);
  });

  content = /* replaceLinksWithSpan( */ fixImgSrcset(content) /* ) */;

  return content;
};
