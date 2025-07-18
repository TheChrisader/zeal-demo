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
import { WRITER_DISTRIBUTION } from "@/constants/writers";
import UserModel from "@/database/user/user.model";

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
  Local: ["687a4955bd707a51307b5ee2"],
  "Across Africa": ["687a4967bd707a51307b5ef0", "687a4967bd707a51307b5ef3"],
  Global: ["687a4979bd707a51307b5efa", "687a4979bd707a51307b5f01"],
  Politics: ["687a4991bd707a51307b5f1e", "687a4991bd707a51307b5f22"],
  Climate: ["687a49a0bd707a51307b5f35", "687a49a0bd707a51307b5f38"],
  Startup: ["687a49b1bd707a51307b5f59", "687a49b1bd707a51307b5f5d"],
  "Economy/Finance": ["687a49cabd707a51307b5f71", "687a49cabd707a51307b5f74"],
  Crypto: ["687a49d6bd707a51307b5f83", "687a49d6bd707a51307b5f8d"],
  Career: ["687a49ebbd707a51307b5fa6", "687a49ebbd707a51307b5fac"],
  "Latest Tech News": ["687a4a0dbd707a51307b5fb2"],
  Fintech: ["687a4a1dbd707a51307b5fb8", "687a4a1dbd707a51307b5fbc"],
  AI: ["687a4a2abd707a51307b5fc3", "687a4a2abd707a51307b5fc6"],
  Health: ["687a4a3ebd707a51307b5fcd"],
  Food: ["687a4a4abd707a51307b5ff8", "687a4a4abd707a51307b5ffa"],
  Travel: ["687a4a59bd707a51307b6008", "687a4a59bd707a51307b600b"],
  Parenting: ["687a4a67bd707a51307b601a", "687a4a67bd707a51307b601d"],
  Fashion: ["687a4a76bd707a51307b6023"],
  "Celebrity News": ["687a4a86bd707a51307b6044", "687a4a86bd707a51307b6049"],
  Profiles: ["687a4a98bd707a51307b605f", "687a4a98bd707a51307b6063"],
  Music: ["687a4aaebd707a51307b6070", "687a4aaebd707a51307b6078"],
  Movies: ["687a4ac9bd707a51307b608a", "687a4ac9bd707a51307b608f"],
  Sports: ["687a4adbbd707a51307b6098", "687a4adbbd707a51307b609d"],
};

const getWriterName = (category: string) => {
  const writers = WRITER_DISTRIBUTION[category];
  if (!writers?.length) {
    return undefined;
  }

  const randomIndex = Math.floor(Math.random() * writers.length);
  return writers[randomIndex];
};

const getUserId = async (username?: string) => {
  try {
    const user = await UserModel.findOne({
      display_name: username,
    });

    if (!user)
      return {
        id: username,
        name: username,
        icon: "/favicon.ico",
      };

    return {
      id: user.username,
      name: user.display_name,
      icon: user.avatar,
    };
  } catch (error) {
    throw error;
  }
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

        if (
          !result.article ||
          !result.preview ||
          result.keywords?.length === 0
        ) {
          continue;
        }
        console.log(result.article);

        const userData = await getUserId(getWriterName(category));

        posts.push({
          title: existingBatch.name,
          slug: slugger.generate(existingBatch.name),
          author_id: userData.id,
          content: result.article,
          description: result.preview,
          image_url: getImageUrlFromArticles(batchedPosts),
          link: `httyd://${generateRandomString(10)}`,
          ttr: calculateReadingTime(result.article),
          category: [category],
          external: false,
          published: true,
          generatedBy: "user",
          keywords: result.keywords,
          source: {
            id: userData.id,
            name: userData.name,
            icon: userData.icon as string,
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
