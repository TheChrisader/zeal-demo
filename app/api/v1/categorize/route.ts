import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import BatchModel from "@/database/batch/batch.model";
import PostModel from "@/database/post/post.model";
import { Id } from "@/lib/database";
import { IBatch, IBatchArticle } from "@/types/batch.type";
import {
  MongoBatchReExecutionError,
  MongoBulkWriteError,
  MongoServerError,
} from "mongodb";
import { MongooseError } from "mongoose";

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

export const categoryMap: { title: string; groups: string[] }[] = [
  { title: "Local", groups: ["Headlines", "Zeal Headline News", "Local"] },
  {
    title: "Across Africa",
    groups: [
      "Top West African News",
      "Top East African News",
      "Top Southern Africa News",
      "Across Africa",
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
      "Global",
    ],
  },
  { title: "Politics", groups: ["Politics"] },
  { title: "Climate", groups: ["Weather", "Climate"] },
  { title: "Startup", groups: ["Startup News", "Startup"] },
  {
    title: "Economy/Finance",
    groups: [
      "Economy",
      "Personal Finance",
      "Market Watch",
      "Business 360",
      "Economy/Finance",
    ],
  },
  { title: "Crypto", groups: ["Crypto"] },
  {
    title: "Career",
    groups: [
      "Latest Job News",
      "Career Tips",
      "Top Global Jobs",
      "Entrepreneurship",
      "Career",
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
  { title: "AI", groups: ["Artificial Intelligence", "AI"] },
  { title: "Health", groups: ["Health News", "Zeal Lifestyle", "Health"] },
  { title: "Food", groups: ["Food & Nutrition", "Food"] },
  { title: "Travel", groups: ["Travel & Tourism", "Travel"] },
  { title: "Parenting", groups: ["Family & Parenting", "Parenting"] },
  { title: "Fashion", groups: ["Style & Beauty", "Fashion"] },
  { title: "Celebrity News", groups: ["Celebrity News"] },
  {
    title: "Profiles",
    groups: ["Hot Interviews", "Zeal Entertainment", "Profiles"],
  },
  { title: "Music", groups: ["Trending Music", "Music"] },
  { title: "Movies", groups: ["Top Movies", "Movies"] },
  {
    title: "Sports",
    groups: ["Top Sports News", "Sports", "UK Premiership", "Basketball"],
  },
];

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

    for (const category of categoryMap) {
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
          $gte: new Date(new Date().setHours(new Date().getHours() - 48)),
          $lt: new Date(),
        },
      })
        .select("_id title source slug link")
        .limit(50)
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

7.  **Minimum and Maximum Batch Count:** You **must** return a minimum of **one (1) batch, with its corresponding articles array,** and a maximum of **two**, in total.
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
      } catch (error) {
        if (error instanceof MongoBulkWriteError) {
          console.log(error.insertedIds);
          // error.insertedIds.forEach((id) => {
          //   const batch = batches.find((batch) => batch._id === id);
          //   if (batch) {
          //     createdBatches.push(batch);
          //   }
          // })
        }
        // console.log(error);
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
