import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import BatchModel from "@/database/batch/batch.model";
import { stripHtml } from "string-strip-html";
import { SlugGenerator } from "@/lib/slug";
import { generateRandomString } from "@/lib/utils";
import { calculateReadingTime } from "@/utils/post.utils";
import { IPost } from "@/types/post.type";
import { newId } from "@/lib/database";

const ensureDelay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getImageUrlFromArticles = (articles: IPost[]) => {
  for (const article of articles) {
    if (article.image_url) {
      return article.image_url;
    }
  }
  return undefined;
};

const ids = {
  Local: [
    "6870d846eee1d779a8ed1aeb",
    "6870d846eee1d779a8ed1aee",
    "6870d846eee1d779a8ed1af1",
    "6870d846eee1d779a8ed1af6",
    "6870d846eee1d779a8ed1afa",
  ],
  "Across Africa": [
    "6870d858eee1d779a8ed1b04",
    "6870d858eee1d779a8ed1b07",
    "6870d858eee1d779a8ed1b0a",
    "6870d858eee1d779a8ed1b0d",
    "6870d858eee1d779a8ed1b11",
  ],
  Global: [
    "6870d86feee1d779a8ed1b1b",
    "6870d86feee1d779a8ed1b1e",
    "6870d86feee1d779a8ed1b20",
    "6870d86feee1d779a8ed1b22",
    "6870d86feee1d779a8ed1b24",
    "6870d86feee1d779a8ed1b26",
    "6870d86feee1d779a8ed1b28",
    "6870d86feee1d779a8ed1b2a",
    "6870d86feee1d779a8ed1b2c",
    "6870d86feee1d779a8ed1b2e",
  ],
  Politics: [
    "6870d887eee1d779a8ed1b3c",
    "6870d887eee1d779a8ed1b3f",
    "6870d887eee1d779a8ed1b43",
    "6870d887eee1d779a8ed1b46",
    "6870d887eee1d779a8ed1b49",
  ],
  Climate: [
    "6870d89deee1d779a8ed1b53",
    "6870d89deee1d779a8ed1b57",
    "6870d89deee1d779a8ed1b5a",
    "6870d89deee1d779a8ed1b5e",
    "6870d89deee1d779a8ed1b62",
    "6870d89deee1d779a8ed1b64",
    "6870d89deee1d779a8ed1b66",
    "6870d89deee1d779a8ed1b68",
    "6870d89deee1d779a8ed1b6a",
    "6870d89deee1d779a8ed1b6c",
  ],
  Startup: [
    "6870d8b8eee1d779a8ed1b7a",
    "6870d8b8eee1d779a8ed1b7c",
    "6870d8b8eee1d779a8ed1b7f",
    "6870d8b8eee1d779a8ed1b82",
    "6870d8b8eee1d779a8ed1b85",
    "6870d8b8eee1d779a8ed1b87",
    "6870d8b8eee1d779a8ed1b89",
    "6870d8b8eee1d779a8ed1b8b",
    "6870d8b8eee1d779a8ed1b8d",
    "6870d8b8eee1d779a8ed1b8f",
  ],
  "Economy/Finance": [
    "6870d8daeee1d779a8ed1b9d",
    "6870d8daeee1d779a8ed1ba6",
    "6870d8daeee1d779a8ed1ba9",
    "6870d8daeee1d779a8ed1bac",
    "6870d8daeee1d779a8ed1baf",
    "6870d8daeee1d779a8ed1bb1",
    "6870d8daeee1d779a8ed1bb3",
    "6870d8daeee1d779a8ed1bb5",
    "6870d8daeee1d779a8ed1bb7",
    "6870d8daeee1d779a8ed1bb9",
  ],
  Crypto: [
    "6870d8eeeee1d779a8ed1bc7",
    "6870d8eeeee1d779a8ed1bcb",
    "6870d8eeeee1d779a8ed1bcf",
    "6870d8eeeee1d779a8ed1bd4",
    "6870d8eeeee1d779a8ed1bd7",
    "6870d8eeeee1d779a8ed1bda",
  ],
  Career: [
    "6870d909eee1d779a8ed1be5",
    "6870d909eee1d779a8ed1be7",
    "6870d909eee1d779a8ed1bea",
    "6870d909eee1d779a8ed1bed",
    "6870d909eee1d779a8ed1bef",
    "6870d909eee1d779a8ed1bf1",
    "6870d909eee1d779a8ed1bf3",
    "6870d909eee1d779a8ed1bf5",
  ],
  "Latest Tech News": [
    "6870d91ceee1d779a8ed1c01",
    "6870d91ceee1d779a8ed1c03",
    "6870d91ceee1d779a8ed1c05",
    "6870d91ceee1d779a8ed1c07",
    "6870d91ceee1d779a8ed1c09",
    "6870d91ceee1d779a8ed1c0b",
    "6870d91ceee1d779a8ed1c0d",
    "6870d91ceee1d779a8ed1c0f",
    "6870d91ceee1d779a8ed1c11",
    "6870d91ceee1d779a8ed1c13",
  ],
  Fintech: [
    "6870d92eeee1d779a8ed1c21",
    "6870d92eeee1d779a8ed1c24",
    "6870d92eeee1d779a8ed1c27",
    "6870d92eeee1d779a8ed1c2a",
    "6870d92eeee1d779a8ed1c2e",
    "6870d92eeee1d779a8ed1c32",
    "6870d92eeee1d779a8ed1c35",
    "6870d92eeee1d779a8ed1c39",
  ],
  AI: [
    "6870d945eee1d779a8ed1c46",
    "6870d945eee1d779a8ed1c4a",
    "6870d945eee1d779a8ed1c4c",
    "6870d945eee1d779a8ed1c4f",
    "6870d945eee1d779a8ed1c51",
    "6870d945eee1d779a8ed1c53",
    "6870d945eee1d779a8ed1c55",
    "6870d945eee1d779a8ed1c57",
    "6870d945eee1d779a8ed1c59",
    "6870d945eee1d779a8ed1c5b",
  ],
  Health: [
    "6870d95ceee1d779a8ed1c69",
    "6870d95ceee1d779a8ed1c6b",
    "6870d95ceee1d779a8ed1c6e",
    "6870d95ceee1d779a8ed1c70",
    "6870d95ceee1d779a8ed1c72",
  ],
  Food: [
    "6870d970eee1d779a8ed1c7b",
    "6870d970eee1d779a8ed1c7d",
    "6870d970eee1d779a8ed1c7f",
    "6870d970eee1d779a8ed1c82",
    "6870d970eee1d779a8ed1c84",
  ],
  Travel: [
    "6870d985eee1d779a8ed1c8d",
    "6870d985eee1d779a8ed1c90",
    "6870d985eee1d779a8ed1c93",
    "6870d985eee1d779a8ed1c95",
    "6870d985eee1d779a8ed1c97",
    "6870d985eee1d779a8ed1c99",
    "6870d985eee1d779a8ed1c9b",
  ],
  Parenting: [
    "6870d99deee1d779a8ed1ca6",
    "6870d99deee1d779a8ed1ca9",
    "6870d99deee1d779a8ed1cb0",
    "6870d99deee1d779a8ed1cb4",
    "6870d99deee1d779a8ed1cba",
  ],
  Fashion: [
    "6870d9bdeee1d779a8ed1cc3",
    "6870d9bdeee1d779a8ed1cc5",
    "6870d9bdeee1d779a8ed1cc8",
    "6870d9bdeee1d779a8ed1cca",
    "6870d9bdeee1d779a8ed1ccc",
    "6870d9bdeee1d779a8ed1cce",
    "6870d9bdeee1d779a8ed1cd1",
    "6870d9bdeee1d779a8ed1cd6",
    "6870d9bdeee1d779a8ed1cd8",
    "6870d9bdeee1d779a8ed1cda",
  ],
  "Celebrity News": [
    "6870d9d0eee1d779a8ed1ce8",
    "6870d9d0eee1d779a8ed1ceb",
    "6870d9d0eee1d779a8ed1cee",
    "6870d9d0eee1d779a8ed1cf0",
    "6870d9d0eee1d779a8ed1cf2",
    "6870d9d0eee1d779a8ed1cf4",
    "6870d9d0eee1d779a8ed1cf6",
  ],
  Profiles: [
    "6870d9f1eee1d779a8ed1d01",
    "6870d9f1eee1d779a8ed1d04",
    "6870d9f1eee1d779a8ed1d07",
    "6870d9f1eee1d779a8ed1d0a",
    "6870d9f1eee1d779a8ed1d0e",
    "6870d9f1eee1d779a8ed1d10",
    "6870d9f1eee1d779a8ed1d12",
    "6870d9f1eee1d779a8ed1d14",
    "6870d9f1eee1d779a8ed1d16",
    "6870d9f1eee1d779a8ed1d18",
  ],
  Music: [
    "6870da0deee1d779a8ed1d26",
    "6870da0deee1d779a8ed1d2a",
    "6870da0deee1d779a8ed1d2d",
    "6870da0deee1d779a8ed1d2f",
    "6870da0deee1d779a8ed1d32",
    "6870da0deee1d779a8ed1d34",
    "6870da0deee1d779a8ed1d36",
    "6870da0deee1d779a8ed1d38",
    "6870da0deee1d779a8ed1d3a",
    "6870da0deee1d779a8ed1d3c",
  ],
  Movies: [
    "6870da28eee1d779a8ed1d4a",
    "6870da28eee1d779a8ed1d4f",
    "6870da28eee1d779a8ed1d51",
    "6870da28eee1d779a8ed1d53",
    "6870da28eee1d779a8ed1d57",
    "6870da28eee1d779a8ed1d59",
    "6870da28eee1d779a8ed1d5b",
    "6870da28eee1d779a8ed1d5d",
    "6870da28eee1d779a8ed1d5f",
  ],
  Sports: [
    "6870da3eeee1d779a8ed1d6c",
    "6870da3eeee1d779a8ed1d71",
    "6870da3eeee1d779a8ed1d73",
    "6870da3eeee1d779a8ed1d75",
    "6870da3eeee1d779a8ed1d78",
    "6870da3eeee1d779a8ed1d7b",
    "6870da3eeee1d779a8ed1d7d",
    "6870da3eeee1d779a8ed1d80",
  ],
};

export const POST = async (request: NextRequest) => {
  console.log("object1");
  try {
    const config = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          article: {
            type: Type.STRING,
          },
          preview: {
            type: Type.STRING,
          },
          keywords: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
        },
        required: ["article", "preview", "keywords"],
      },
    };

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY as string,
    });

    const slugger = new SlugGenerator();

    for (const [category, articles] of Object.entries(ids)) {
      const existingBatches = await BatchModel.find({
        _id: {
          $in: articles.map((id) => newId(id)),
        },
      })
        .select("_id name articles.id")
        .exec();

      const posts: Partial<IPost>[] = [];

      for (const existingBatch of existingBatches) {
        const batchedPosts = await PostModel.find({
          _id: { $in: existingBatch.articles.map((a) => a.id) },
        })
          .select("content image_url")
          .exec();

        const content = batchedPosts
          .map((post) => stripHtml(post.content).result)
          .join("\n----\n");

        const prompt = `Pre: You are an AI assistant tasked with generating structured article content. Be extremely strict, detailed, and cautiously specific. Adhere *precisely* to all instructions, including formatting, content constraints, and conditional logic. Do *not* use any external knowledge or information beyond what is provided in the 'Input Content' section. Recheck your work carefully before responding.

Instructions:

1.  **Analyze Input Content:** Examine the text provided below under 'Input Content'.
2.  **Handle Empty Input:**
    *   If the 'Input Content' is completely blank, empty, or contains only whitespace, you MUST leave the article, preview and keywords fields empty.
    *   Do not add any other text or explanation if the input is empty.
3.  **Process Non-Empty Input:**
    *   If the 'Input Content' is not empty, perform the following steps:
        a.  **Synthesize Article:** Carefully read and synthesize the key information from *all* provided article text(s) in the 'Input Content'. Write a *new*, comprehensive, lengthy and coherent article that integrates the main points and themes found *strictly* within the provided text(s). The goal is a detailed synthesis, not just a summary. Ensure logical flow and structure. Format the *entire* synthesized article as HTML. It MUST be enclosed within a single <div> tag. Each paragraph within the article MUST be enclosed within <p> tags. Ensure the HTML is clean and well-formatted (e.g., <p>Paragraph text.</p>). 
        b.  **Generate Preview:** Write a short (2-3 sentences), well formatted, coherent preview text that accurately summarizes the core topic of the synthesized article and entices a reader, like a real news article preview.
        c.  **Extract Keywords:** Identify and list 5-10 relevant keywords or key phrases from the synthesized article that capture its main subjects and themes. Provide these as an array of strings.
        d.  **Correct for Anomalies:** Ensure you take care of any abnormality, mistake, or error in the synthesized article. If there are any errors, typos, or anomalies, correct them. Do not produce an abnormal output. This includes, but is not limited to, unnaturally long sequences of repeated text/characters, content/output that clearly does not conform to the title of the article (in which case, return null), long generated previews, and incomplete responses.

Example Output:
{
  "article": "<div>\n  <p>The Indian SUV market is seeing a surge in demand for compact SUVs, with the sub-segment clocking 1.38 
million units in wholesales in FY2025, a 10% increase year-on-year. This accounts for nearly 50% of the total SUV sales of 2.79 million units, indicating that every second SUV sold in India is a sub-4-meter model. Out of the nearly 100 SUV models available, 
20 are compact SUVs, with 10 of them leading the charge in the segment.</p>\n  <p><b>1. Tata Punch:</b> Topping the sales chart for the first time since its launch in October 2021, the Tata Punch recorded 196,572 units, a 15% year-on-year growth. The Punch, 
available in petrol, CNG, and electric powertrains, has risen two ranks from the previous year. Total domestic sales have crossed 550,000 units since its launch, contributing to 35% of Tata Motors' total passenger vehicle sales in FY2025.</p>\n  <p><b>2. Maruti Brezza:</b> The Maruti Brezza, a long-standing player in the compact SUV segment, secured second place with 189,163 units, an 11% increase year-on-year. The Brezza has sold a total of 1.24 million units in India since its launch and is available in petrol and CNG powertrains.</p>\n  <p><b>3. Maruti Suzuki Fronx:</b> The Baleno-based Maruti Fronx reached third place with 166,216 units, a 23% year-on-year growth. The Fronx recorded its best-ever sales in February 2025 and has achieved cumulative sales of 300,951 units since its launch in April 2023, making it the first Nexa SUV to hit the 300,000 milestone.</p>\n  <p><b>4. Tata Nexon:</b> The Tata Nexon, previously India's top-selling SUV for three consecutive years, experienced a 5% year-on-year decline, selling 163,088 units. Despite the launch of the Nexon CNG, the model has faced increased competition and pressure from its sibling, the Punch.</p>\n  <p><b>5. Hyundai Venue:</b> The Hyundai Venue also saw a decrease in sales, with 119,113 units sold, down 8% year-on-year. Demand has been flagging, especially with the introduction of the Hyundai Exter. The next-generation Venue is expected 
to launch by the end of 2025 or early 2026.</p>\n  <p><b>6. Mahindra 3XO:</b> The Mahindra 3XO has been a strong performer, selling 100,905 units and moving up to sixth place in FY2025. This represents an impressive 84% year-on-year increase. The 3XO's share in Mahindra's SUV sales has risen to 18% from 12% in FY2024.</p>\n  <p><b>7. Kia Sonet:</b> With sales of 99,805 units, the Kia 
Sonet recorded a 23% year-on-year growth and is Kia India's best-selling product for the fiscal year. The Sonet surpassed the 400,000 milestone in early February.</p>\n  <p><b>8. Mahindra Bolero:</b> The Mahindra Bolero brand, including the Bolero, Bolero Neo, and Bolero Neo Plus, sold an estimated 94,750 units, down 15% year-on-year. The Bolero's sales decline has reduced its share in Mahindra's sales to 17% from 24% in FY2024. The Bolero, sold only with a diesel powertrain, continues to attract buyers in rural areas and Tier 3 cities.</p>\n  <p><b>9. Hyundai Exter:</b> The Hyundai Exter, the brand's second compact SUV and first CNG model with dual-cylinder technology, sold 77,412 units in FY2025, up 9% year-on-year. Cumulative sales total 148,641 units. The entry-SUV category continues to experience strong demand, with sales of around 20,000 units per month.</p>\n  <p><b>10. Mahindra Thar 3-door:</b> The 3-door Mahindra Thar sold an estimated 47,000 units, down 28% year-on-year. This decline is attributed to the demand for the five-door Thar Roxx, launched in September 2024, which has already entered the best-selling midsize SUV chart. The Thar brand (3-door and 5-door combined) posted total sales of 84,834 units last year.</p>\n</div>",
  "keywords": [
    "Tata Punch",
    "Maruti Brezza",
    "Maruti Suzuki Fronx",
    "Tata Nexon",
    "Hyundai Venue",
    "Mahindra 3XO",
    "Kia Sonet",
    "compact SUVs",
    "Indian SUV market",
    "FY2025 sales"
  ],
  "preview": "The Indian SUV market sees compact SUVs leading sales in FY2025, with Tata Punch topping the charts. Maruti Brezza 
and Fronx follow in the top three, showcasing the popularity of sub-4-meter models in India."
}

Example Output with missing, malformed, or irrelevant content:
{
  "article": "",
  "preview": "",
  "keywords": []
}

Input Content:
${content}
`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-05-20",
          contents: prompt,
          config: config,
        });

        console.log(response.text);
        if (!response.text || response.text === "undefined") continue;
        const result = JSON.parse(response.text as string);

        console.log("object");
        if (
          !result.article ||
          !result.preview ||
          result.keywords?.length === 0
        ) {
          continue;
        }
        console.log(result.article);

        posts.push({
          title: existingBatch.name,
          slug: slugger.generate(existingBatch.name),
          author_id: "Zeal News",
          content: result.article,
          description: result.preview,
          image_url: getImageUrlFromArticles(batchedPosts),
          link: `httyd://${generateRandomString(10)}`,
          ttr: calculateReadingTime(result.article),
          category: [category],
          external: false,
          published: true,
          generatedBy: "zeal",
          keywords: result.keywords,
          source: {
            name: "Zeal News",
            icon: "/favicon.ico",
          },
        });

        ensureDelay(5000);
      }
      await PostModel.create(posts, { ordered: false });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(`Error categorizing post: ${error}`);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
};
