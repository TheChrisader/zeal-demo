import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
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
    "6803d77663ba8a8edf2b12d3",
    "6803d77663ba8a8edf2b12d9",
    "6803d77663ba8a8edf2b12dd",
    "6803d77663ba8a8edf2b12e0",
    "6803d77663ba8a8edf2b12e4",
    "6803d77663ba8a8edf2b12e7",
    "6803d77663ba8a8edf2b12e9",
  ],
  "Zeal Global": [
    "6803d77d63ba8a8edf2b12f5",
    "6803d77d63ba8a8edf2b12f8",
    "6803d77d63ba8a8edf2b12fb",
    "6803d77d63ba8a8edf2b1300",
    "6803d77d63ba8a8edf2b1302",
    "6803d77d63ba8a8edf2b1304",
  ],
  "Zeal Entertainment": [
    "6803d78563ba8a8edf2b130e",
    "6803d78563ba8a8edf2b1313",
    "6803d78563ba8a8edf2b1317",
    "6803d78563ba8a8edf2b131a",
    "6803d78563ba8a8edf2b131c",
    "6803d78563ba8a8edf2b131f",
    "6803d78563ba8a8edf2b1321",
  ],
  "Business 360": [
    "6803d78a63ba8a8edf2b132c",
    "6803d78a63ba8a8edf2b132e",
    "6803d78a63ba8a8edf2b1330",
    "6803d78a63ba8a8edf2b1332",
    "6803d78a63ba8a8edf2b1334",
    "6803d78a63ba8a8edf2b1336",
  ],
  "Zeal Lifestyle": [
    "6803d79163ba8a8edf2b1341",
    "6803d79163ba8a8edf2b1343",
    "6803d79163ba8a8edf2b1346",
    "6803d79163ba8a8edf2b134b",
    "6803d79163ba8a8edf2b134f",
    "6803d79163ba8a8edf2b1354",
  ],
  "Zeal Tech": [
    "6803d79663ba8a8edf2b1361",
    "6803d79663ba8a8edf2b1364",
    "6803d79663ba8a8edf2b1367",
    "6803d79663ba8a8edf2b136a",
    "6803d79663ba8a8edf2b136d",
    "6803d79663ba8a8edf2b1370",
  ],
  "Zeal Sports": [
    "6803d7a063ba8a8edf2b137a",
    "6803d7a063ba8a8edf2b137d",
    "6803d7a063ba8a8edf2b1380",
    "6803d7a063ba8a8edf2b1382",
    "6803d7a063ba8a8edf2b1385",
  ],
};

export const POST = async (request: NextRequest) => {
  try {
    const schema = {
      description: "Article generated",
      type: SchemaType.OBJECT,
      properties: {
        article: {
          type: SchemaType.STRING,
          description:
            "The article generated, in html, within <div> tags, text within <p> tags, well formatted and ready to be copied and pasted into a markdown file",
          nullable: false,
        },
        preview: {
          type: SchemaType.STRING,
          description:
            "A short preview giving a taste of the content of the article, written like a real news article preview.",
          nullable: false,
        },
        keywords: {
          type: SchemaType.ARRAY,
          description: "Keywords for the article",
          nullable: false,
          items: {
            type: SchemaType.STRING,
            description: "Keywords for the article",
            nullable: false,
          },
        },
      },
    };

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const slugger = new SlugGenerator();

    for (const [category, articles] of Object.entries(ids)) {
      const existingBatches = await BatchModel.find({
        _id: {
          $in: articles.map((id) => newId(id)),
        },
        // updated_at: {
        //   $gte: new Date(new Date().setHours(new Date().getHours() - 6)),
        //   $lt: new Date(),
        // },
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
          .join("\n\n");

        const prompt = `
    Pre: Be extremely strict, detailed, and cautiously specific. Think carefully before responding, and recheck your work.
    Instructions: 
    Read, and write a lengthy article based on the following articles:
    ${content}
    `;

        const ai_response = await model.generateContent(prompt);
        const result = JSON.parse(ai_response.response.text());

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
