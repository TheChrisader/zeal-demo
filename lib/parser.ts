import { Readability } from "@mozilla/readability";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import jsdom from "jsdom";

export async function fetchAndParseURL(url: string) {
  const virtualConsole = new jsdom.VirtualConsole();
  try {
    const response = await fetch(url, {
      // headers: {
      //   "User-Agent":
      //     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      // },
    });

    const html = await response.text();

    const dom = new JSDOM(html, {
      url: url,
      virtualConsole: virtualConsole,

      // contentType: "text/html",
      // includeNodeLocations: true,
    });

    const domPurify = createDOMPurify(dom.window);

    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (article) {
      const sanitizedContent = domPurify.sanitize(article.content);
      article.content = sanitizedContent;
      return article;
    } else {
      throw new Error("Failed to parse the page.");
    }
  } catch (error) {
    throw new Error("Error fetching or parsing the page:");
  }
}
