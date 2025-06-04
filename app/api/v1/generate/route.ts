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
  "Zeal Headline News": [
    "6840158ac83037c807b913c8",
    "6840158ac83037c807b913ca",
    "6840158ac83037c807b913cd",
    "6840158ac83037c807b913d0",
    "6840158ac83037c807b913d6",
    "6840158ac83037c807b913dc",
    "6840158ac83037c807b913e0",
    "6840158ac83037c807b913e3",
    "6840158ac83037c807b913e6",
    "6840158ac83037c807b913ee",
    "6840158ac83037c807b913f2",
    "6840158ac83037c807b913f6",
    "6840158ac83037c807b913fa",
    "6840158ac83037c807b913fd",
    "6840158ac83037c807b91400",
    "6840158ac83037c807b91402",
    "6840158ac83037c807b91404",
  ],
  "Zeal Global": [
    "6840161ac83037c807b9141a",
    "6840161ac83037c807b91429",
    "6840161ac83037c807b9142f",
    "6840161ac83037c807b91432",
    "6840161ac83037c807b9143a",
    "6840161ac83037c807b91440",
    "6840161ac83037c807b91442",
    "6840161ac83037c807b91445",
    "6840161ac83037c807b91447",
    "6840161ac83037c807b91449",
    "6840161ac83037c807b9144c",
    "6840161ac83037c807b91450",
    "6840161ac83037c807b91453",
    "6840161ac83037c807b91456",
    "6840161ac83037c807b91459",
    "6840161ac83037c807b9145c",
  ],
  "Zeal Entertainment": [
    "68401680c83037c807b91472",
    "68401680c83037c807b91475",
    "68401680c83037c807b91478",
    "68401680c83037c807b9147b",
    "68401680c83037c807b9147e",
    "68401680c83037c807b91481",
    "68401680c83037c807b91487",
    "68401680c83037c807b9148a",
    "68401680c83037c807b9148d",
    "68401680c83037c807b91490",
  ],
  "Business 360": [
    "684016eac83037c807b914a0",
    "684016eac83037c807b914a4",
    "684016eac83037c807b914a7",
    "684016eac83037c807b914aa",
    "684016eac83037c807b914ae",
    "684016eac83037c807b914b2",
    "684016eac83037c807b914b4",
    "684016eac83037c807b914b6",
    "684016eac83037c807b914b8",
    "684016eac83037c807b914bb",
    "684016eac83037c807b914be",
    "684016eac83037c807b914c1",
    "684016eac83037c807b914c4",
    "684016eac83037c807b914c7",
    "684016eac83037c807b914c9",
    "684016eac83037c807b914cb",
    "684016eac83037c807b914ce",
    "684016eac83037c807b914d0",
  ],
  "Zeal Lifestyle": [
    "6840172ac83037c807b914e6",
    "6840172ac83037c807b914e8",
    "6840172ac83037c807b914ed",
    "6840172ac83037c807b914f0",
    "6840172ac83037c807b914f3",
    "6840172ac83037c807b914f6",
    "6840172ac83037c807b914f8",
    "6840172ac83037c807b914fa",
    "6840172ac83037c807b914fc",
    "6840172ac83037c807b914fe",
  ],
  "Zeal Tech": [
    "68401787c83037c807b9150d",
    "68401787c83037c807b91512",
    "68401787c83037c807b91515",
    "68401787c83037c807b91518",
    "68401787c83037c807b9151c",
    "68401787c83037c807b9151f",
    "68401787c83037c807b91521",
    "68401787c83037c807b91527",
    "68401787c83037c807b9152b",
    "68401787c83037c807b9152d",
    "68401787c83037c807b91530",
    "68401787c83037c807b91536",
    "68401787c83037c807b91538",
    "68401787c83037c807b9153b",
    "68401787c83037c807b9153d",
    "68401787c83037c807b9153f",
    "68401787c83037c807b91541",
    "68401787c83037c807b91544",
    "68401787c83037c807b91547",
    "68401787c83037c807b9154a",
  ],
  "Zeal Sports": [
    "68401802c83037c807b91563",
    "68401802c83037c807b91565",
    "68401802c83037c807b91567",
    "68401802c83037c807b91569",
    "68401802c83037c807b9156b",
    "68401802c83037c807b9156d",
    "68401802c83037c807b91570",
    "68401802c83037c807b91573",
    "68401802c83037c807b91577",
    "68401802c83037c807b9157d",
    "68401802c83037c807b91580",
    "68401802c83037c807b91585",
    "68401802c83037c807b9158a",
    "68401802c83037c807b9158d",
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
          model: "gemini-2.5-pro-preview-05-06",
          contents: prompt,
          config: config,
        });

        console.log(response.text);
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
