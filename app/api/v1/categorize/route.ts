import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import BatchModel from "@/database/batch/batch.model";
import PostModel from "@/database/post/post.model";
import { Id } from "@/lib/database";
import { IBatch, IBatchArticle } from "@/types/batch.type";

function mergeArraysWithUniqueSourceUrls(
  sourceArray: IBatchArticle[],
  targetArray: IBatchArticle[] = [],
) {
  const existingUrls = new Set(targetArray.map((item) => item.source_url));
  const uniqueItems = [];
  const sourceUrlsAdded = new Set();

  for (const item of sourceArray) {
    if (
      item.source_url &&
      !existingUrls.has(item.source_url) &&
      !sourceUrlsAdded.has(item.source_url)
    ) {
      uniqueItems.push(item);
      sourceUrlsAdded.add(item.source_url);
    }
  }

  targetArray.push(...uniqueItems);
  return targetArray;
}

const categoryTypeMap: Record<string, string> = {
  "Zeal Headline News": "Headlines around Africa (priority), and the world",
  "Zeal Global": "Top Global News",
  "Zeal Entertainment": "Celebrity News, Music, Movies and TV",
  "Business 360": "Economy, Finance and Business",
  "Zeal Lifestyle": "Health, Fitness, Family, Style and Travel",
  "Zeal Tech": "Latest Tech News",
  "Zeal Sports": "Latest Sports News",
};

export const POST = async () => {
  const batchResults: { [key: string]: Id[] } = {};
  const categories: { title: string; groups: string[] }[] = [
    { title: "Zeal Headline News", groups: ["Headlines", "Politics"] },
    {
      title: "Zeal Global",
      groups: ["Top US News", "UK Top News", "EU News", "Asian News"],
    },
    {
      title: "Zeal Entertainment",
      groups: [
        "Celebrity News",
        "Top Movies",
        "Trending Music",
        "Hot Interviews",
      ],
    },
    {
      title: "Business 360",
      groups: [
        "Economy",
        "Personal Finance",
        "Market Watch",
        "Startup News",
        "Entrepreneurship",
        "E-commerce",
      ],
    },
    {
      title: "Zeal Lifestyle",
      groups: [
        "Health News",
        "Food & Nutrition",
        "Travel & Tourism",
        "Style & Beauty",
        "Family & Parenting",
      ],
    },
    {
      title: "Zeal Tech",
      groups: [
        "Latest Tech News",
        "Artificial Intelligence",
        "Crypto",
        "Fintech",
        "Cartech",
        "Gadgets Buying Guide",
      ],
    },
    {
      title: "Zeal Sports",
      groups: ["Top Sports News", "UK Premiereship", "Basketball", "Gaming"],
    },
  ];

  try {
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY as string,
    });

    // const model = genAI.getGenerativeModel({
    //   model: "gemini-2.5-flash-preview-04-17",
    //   generationConfig: {
    //     responseMimeType: "application/json",
    //     responseSchema: schema,
    //   },
    // });

    for (const category of categories) {
      const { title, groups } = category;

      const existingBatches = await BatchModel.find({
        category: title,
        created_at: {
          $gte: new Date(new Date().setHours(new Date().getHours() - 1)),
        },
      })
        .select("_id name")
        .exec();

      const existingBatchesList = existingBatches.map((batch) => batch.name);

      const posts = await PostModel.find({
        category: {
          $in: groups,
        },
        published_at: {
          $gte: new Date(new Date().setHours(new Date().getHours() - 7)),
          $lt: new Date(),
        },
      })
        .select("_id title source slug link")
        .exec();

      const postsList = posts.map((post) => post.title).join(" \n");
      console.log(postsList);

      const prompt = `
# Role & Goal
Act as a meticulous and strict news analyst. Your task is to analyze a list of news article titles and group them into batches based on specific criteria. Be extremely cautious, detail-oriented, and prioritize accuracy according to the rules below. Double-check your reasoning before finalizing the output.

# Input Data
- **Article Titles:** A list of news article titles provided under "Article Titles".
- **Category Context:** All provided articles belong to the category: ${categoryTypeMap[title]}. Your analysis should remain within this context.

# Batching Rules & Logic

## Primary Logic: Event-Based Batching
1.  **Identify Same Event:** Scrutinize the titles to find groups where **two or more titles** clearly and unambiguously refer to the **exact same specific news event**. This requires more than just a similar topic; look for shared specific details like names, locations, specific actions, or outcomes implied in the titles.
2.  **Strict Inclusion:** Be highly conservative. If a title's connection to a specific event batch is uncertain or merely topical, **do not include it** in that batch.
3.  **Form Event Batches:** Create a distinct batch for each group of 2+ titles identified as covering the same specific event.

## Fallback Logic: Single Important/Interesting Articles
4.  **Trigger Condition:** Execute this step **only if** the Primary Logic (steps 1-3) results in **zero** event batches being formed.
5.  **Select Singles:** From the original list, identify what appear to be the most **significant, impactful, or unique** news article titles based *only* on the information present in the title itself. Prioritize titles suggesting major developments, specific data, or unusual occurrences. This will, of course, be relative.
6.  **Form Single-Article Batches:** Create a separate batch for **each** selected single article title. Each such batch will contain exactly one article title in its articles array.

# Output Requirements

7.  **Minimum Batch Count:** You **must** return a minimum of **five (5) batches, with their corresponding articles array,** in total. You are free to return less if you find it not possible to form at least five batches (not enough articles provided). Ideally, there should be more than 5.
    *   **Scenario A (Sufficient Event Batches):** If the Primary Logic yields 2 or more event batches, return those event batches and their corresponding articles.
    *   **Scenario B (Insufficient Event Batches):** If the Primary Logic yields 1 to 4 event batches, return those event batches. Then, supplement them by creating additional single-article batches (selecting articles as per step 5, ensuring they aren't already in an event batch) until the total number of batches, with their corresponding articles array, reaches five.
    *   **Scenario C (No Event Batches):** If the Fallback Logic (step 4) is triggered, ensure you select and create *at least* five single-article batches according to steps 5 and 6.
8.  **Batch Naming ("batch" field):**
    *   For **event batches**, the name must be a concise, descriptive headline summarizing the specific event covered by the articles in that batch.
    *   For **single-article batches**, the name should be a concise, descriptive headline capturing the essence of that single article's title. It can be a rephrasing or abstraction of the original title.

**Correct for Anomalies:** Ensure you take care of any abnormality, mistake, or error in the synthesized result. If there are any errors, typos, or anomalies, correct them. Do not produce an abnormal output. This includes, but is not limited to, unnaturally long sequences of repeated text/characters, content/output that clearly does not conform to the goals of the request, unnaturally long batch titles, anything but article titles under the articles field, and broken responses too long to fit in your token window.
**Batch Naming:** Each batch should be sufficiently, but reasonably, unique in its titling - without being overly so. It shouldn't be too generic, broad or vague. It should be specific and meaningful, to stand the test of time, so to speak.

# Example Event Batch for an Example Category Context (Latest Tech News):
{
 "batch": "BB Biotech AG Reports Net Loss for Q1 2025",
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
 "batch": "BB Biotech AG Reports Net Loss for Q1 2025",
 "articles": [
 "Major Biotech Company, BB Biotech AG, faces major market challenges"
 ]
}

# Category Context Value:
${categoryTypeMap[title]}

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
        model: "gemini-2.0-flash",
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

      const batches = [];

      for (const generatedBatch of generated_batches) {
        const { batch, articles } = generatedBatch;
        const batchedArticles: IBatchArticle[] = [];

        for (const article of articles) {
          const post = posts.find((post) => post.title === article);

          if (post) {
            batchedArticles.push({
              id: post._id,
              title: post.title,
              slug: post.slug,
              source_url: post.link as string,
              source_name: post.source.name as string,
              source_icon: post.source.icon as string,
            });
          }
        }

        if (existingBatchesList.includes(batch)) {
          console.log("Batch caught");
          const existingBatch = await BatchModel.findOne({
            name: batch,
          }).exec();

          if (!existingBatch) {
            continue;
          }

          existingBatch.articles = mergeArraysWithUniqueSourceUrls(
            batchedArticles,
            existingBatch.articles,
          );
          // [
          //   ...new Set([...existingBatch.articles, ...batchedArticles]),
          // ];

          await existingBatch.save();

          // await BatchModel.findOneAndUpdate(
          //   { name: batch },
          //   { $push: { articles: { $each: batchedArticles } } },
          //   { new: true },
          // );
          continue;
        }

        const newBatch = {
          name: batch,
          articles: mergeArraysWithUniqueSourceUrls(batchedArticles),
        };

        batches.push(newBatch);
      }

      let createdBatches: IBatch[] = [];
      try {
        createdBatches = await BatchModel.create(
          batches.filter((batch) => batch.articles.length > 0),
          {
            ordered: false,
          },
        );
      } catch {
        console.log("????????????????????????????????????????");
      }

      if (createdBatches.length === 0) {
        continue;
      }
      // const createdBatches = await Promise.all(
      //   batches.map((batch) => BatchModel.create(batch)),
      // )
      batchResults[title] = createdBatches.map((batch) => batch._id!);
    }

    return NextResponse.json(batchResults);
  } catch (error) {
    console.log(`Error categorizing post: ${error}`);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
};
