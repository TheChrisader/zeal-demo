import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import ArticleModel from "@/database/article/article.model";

interface IBatch {
  name: string;
  articles: string[];
}

export const categoryMap: { title: string; groups: string[] }[] = [
  { title: "Local", groups: ["Headlines", "Zeal Headline News"] },
  {
    title: "Across Africa",
    groups: [
      "Top West African News",
      "Top East African News",
      "Top Southern Africa News",
    ],
  },
  {
    title: "Global",
    groups: [
      "Top US News",
      "UK Top News",
      "EU News",
      "Asian News",
      "Zeal Global",
    ],
  },
  { title: "Politics", groups: ["Politics"] },
  { title: "Climate", groups: ["Weather"] },
  { title: "Startup", groups: ["Startup News"] },
  {
    title: "Economy/Finance",
    groups: ["Economy", "Personal Finance", "Market Watch", "Business 360"],
  },
  { title: "Crypto", groups: ["Crypto"] },
  {
    title: "Career",
    groups: [
      "Latest Job News",
      "Career Tips",
      "Top Global Jobs",
      "Entrepreneurship",
    ],
  },
  {
    title: "Latest Tech News",
    groups: [
      "Latest Tech News",
      "Cartech",
      "Gadgets Buying Guide",
      "Gaming",
      "Zeal Tech",
    ],
  },
  { title: "Fintech", groups: ["Fintech"] },
  { title: "AI", groups: ["Artificial Intelligence"] },
  { title: "Health", groups: ["Health News", "Zeal Lifestyle"] },
  { title: "Food", groups: ["Food & Nutrition"] },
  { title: "Travel", groups: ["Travel & Tourism"] },
  { title: "Parenting", groups: ["Family & Parenting"] },
  { title: "Fashion", groups: ["Style & Beauty"] },
  { title: "Celebrity News", groups: ["Celebrity News"] },
  {
    title: "Profiles",
    groups: ["Hot Interviews", "Zeal Entertainment"],
  },
  { title: "Music", groups: ["Trending Music"] },
  { title: "Movies", groups: ["Top Movies"] },
  {
    title: "Sports",
    groups: ["Top Sports News", "UK Premiership", "Basketball"],
  },
];

export const POST = async () => {
  const batchResults: { [key: string]: IBatch[] } = {};

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY as string,
    });

    for (const category of categoryMap) {
      const { title, groups } = category;

      let query = {};
      if (category.title === "Local") {
        query = {
          country: {
            $in: ["Nigeria"],
          },
        };
      } else {
        query = {
          category: {
            $in: groups,
          },
        };
      }

      const posts = await ArticleModel.find({
        ...query,
        published_at: {
          $gte: new Date(new Date().setHours(new Date().getHours() - 8)),
          $lt: new Date(),
        },
      })
        .select("_id title source slug link")
        .limit(100)
        .exec();

      const postsList = posts.map((post) => post.title).join(" \n");
      console.log(postsList);

      const prompt = `
# Role & Goal
Act as a meticulous and strict news analyst. Your task is to analyze a list of news article titles and group them into batches based on specific criteria. Be extremely cautious, detail-oriented, and prioritize accuracy according to the rules below. Double-check your reasoning before finalizing the output.

# Input Data
- **Article Titles:** A list of news article titles provided under "Article Titles".
- **Category Context:** All provided articles belong to the category: ${title}. Your analysis should remain within this context.

# Batching Rules & Logic

## Primary Logic: Event-Based Batching
1.  **Identify Same Event:** Scrutinize the titles to find groups where **two or more titles** clearly and unambiguously refer to the **exact same specific news event**. This requires more than just a similar topic; look for shared specific details like names, locations, specific actions, or outcomes implied in the titles. A **specific** event or story, not one or more closely or loosely related events.
2.  **Strict Inclusion:** Be highly conservative. If a title's connection to a specific event batch is uncertain or merely topical, **do not include it** in that batch.
3.  **Form Event Batches:** Create a distinct batch for each group of 2+ titles identified as covering the same specific event.

## Fallback Logic: Single Important/Interesting Articles
4.  **Trigger Condition:** Execute this step **only if** the Primary Logic (steps 1-3) results in **zero** event batches being formed.
5.  **Select Singles:** From the original list, identify what appear to be the most **significant, impactful, or unique** news article titles based *only* on the information present in the title itself. Prioritize titles suggesting major developments, specific data, or unusual occurrences. This will, of course, be relative.
6.  **Form Single-Article Batches:** Create a separate batch for **each** selected single article title. Each such batch will contain exactly one article title in its articles array.

# Output Requirements

7.  **Minimum and Maximum Batch Count:** You **must** return a minimum of **one (1) batch, with its corresponding articles array,** and a maximum of **two**, in total, only if articles are provided. If there are none, resort to leaving the values empty or undefined. Do **NOT** return any batches if no articles are provided or attempt to explain your rationale for doing so under any circumstance.
    *   **Scenario A (Sufficient Event Batches):** If the Primary Logic yields 2 or more event batches, return the top two hottest batches only.
    *   **Scenario B (No Event Batches):** If the Fallback Logic (step 4) is triggered, ensure you select and create *at least* one single-article batch according to steps 5 and 6.
    *   **Maximum Batch Count:** You are **not allowed** to return more than **two (2) batches** in total. So, ensure to prioritize sensibly.
8.  **Batch Naming ("batch" field):**
    *   For **event batches**, the name must be a concise, descriptive headline summarizing the specific event covered by the articles in that batch. Tend more towards being sensational and interesting than a dry recap.
    *   For **single-article batches**, the name should be a concise, descriptive headline capturing the essence of that single article's title. It can be a rephrasing or abstraction of the original title. Tend more towards being sensational and interesting than a dry recap.

**Correct for Anomalies:** Ensure you take care of any abnormality, mistake, or error in the synthesized result. If there are any errors, typos, or anomalies, correct them. Do not produce an abnormal output. This includes, but is not limited to, unnaturally long sequences of repeated text/characters, content/output that clearly does not conform to the goals of the request, unnaturally long batch titles, anything but article titles under the articles field, and broken responses too long to fit in your token window.
**Batch Naming:** Each batch should be sufficiently, but reasonably, unique in its titling - without being overly so. It shouldn't be too generic, broad or vague. It should be specific and meaningful, to stand the test of time, so to speak.

# Example Event Batch for an Example Category Context (Latest Tech News):
{
 "batch": "New in: Major Biotech Company, BB Biotech AG, Reports Net Loss for Q1 2025",
 "articles": [
 "EQS-Adhoc: BB Biotech AG publishes its interim report",
 "BB Biotech AG Reports CHF 241 Million Net Loss for Q1 2025",
 "BB Biotech AG Reports Net Loss",
 "BB Biotech AG fails to meet expectations in Q1 2025",
 "Major Biotech Company, BB Biotech AG, faces major market challenges"
 ]
}

# Example Single Article Batch for an Example Category Context (Latest Tech News):
{
 "batch": "New in: Major Biotech Company, BB Biotech AG, Reports Net Loss for Q1 2025",
 "articles": [
 "Major Biotech Company, BB Biotech AG, faces major market challenges"
 ]
}

# Category Context Value:
${title}

# Article Titles:
${postsList}
`;

      const config = {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              batch: { type: Type.STRING },
              articles: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["batch", "articles"],
          },
        },
      };

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-05-20",
        contents: prompt,
        config: config,
      });

      let generated_batches = [];
      try {
        console.log(result.text);
        generated_batches = JSON.parse(result.text as string);
      } catch (error) {
        console.log(`Error parsing response: ${error}`);
        return NextResponse.json("Internal Server Error", { status: 500 });
      }

      const batches: IBatch[] = [];

      for (const generatedBatch of generated_batches) {
        const { batch, articles } = generatedBatch;
        const batchedArticles: string[] = [];

        if (articles.length <= 0) {
          continue;
        }

        for (const article of articles) {
          const post = posts.find((post) => post.title === article);

          if (post) {
            batchedArticles.push(post._id.toString());
          }
        }

        const newBatch = {
          name: batch,
          articles: batchedArticles,
        };

        batches.push(newBatch);
      }

      if (batches.length === 0) {
        continue;
      }

      batchResults[title] = batches;
    }

    return NextResponse.json(batchResults);
  } catch (error) {
    console.log(`Error categorizing post: ${error}`);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
};
