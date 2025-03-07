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
    "67cacfd60cda1cf4d41a0cc4",
    "67cacfd60cda1cf4d41a0cf9",
    "67cacfd60cda1cf4d41a0d01",
    "67cacfd60cda1cf4d41a0d03",
    "67cacfd60cda1cf4d41a0d08",
    "67cacfd60cda1cf4d41a0d0d",
    "67cacfd60cda1cf4d41a0d10",
    "67cacfd60cda1cf4d41a0d15",
    "67cacfd60cda1cf4d41a0d1c",
    "67cacfd60cda1cf4d41a0d21",
    "67cacfd60cda1cf4d41a0d26",
    "67cacfd60cda1cf4d41a0d2c",
    "67cacfd60cda1cf4d41a0d2f",
    "67cacfd60cda1cf4d41a0d34",
    "67cacfd60cda1cf4d41a0d38",
    "67cacfd60cda1cf4d41a0d3c",
    "67cacfd60cda1cf4d41a0d40",
    "67cacfd60cda1cf4d41a0d43",
    "67cacfd60cda1cf4d41a0d47",
    "67cacfd60cda1cf4d41a0d4a",
    "67cacfd60cda1cf4d41a0d4f",
    "67cacfd60cda1cf4d41a0d52",
    "67cacfd60cda1cf4d41a0d56",
    "67cacfd60cda1cf4d41a0d5a",
    "67cacfd60cda1cf4d41a0d5f",
  ],
  "Zeal Global": [
    "67cacfe50cda1cf4d41a0d7e",
    "67cacfe50cda1cf4d41a0d81",
    "67cacfe50cda1cf4d41a0d84",
    "67cacfe50cda1cf4d41a0d87",
    "67cacfe50cda1cf4d41a0d8a",
    "67cacfe50cda1cf4d41a0d8d",
    "67cacfe50cda1cf4d41a0d90",
    "67cacfe50cda1cf4d41a0d94",
    "67cacfe50cda1cf4d41a0d98",
    "67cacfe50cda1cf4d41a0d9e",
    "67cacfe50cda1cf4d41a0da2",
    "67cacfe50cda1cf4d41a0da7",
    "67cacfe50cda1cf4d41a0dac",
    "67cacfe50cda1cf4d41a0db1",
    "67cacfe50cda1cf4d41a0db6",
    "67cacfe50cda1cf4d41a0db9",
    "67cacfe50cda1cf4d41a0dbc",
    "67cacfe50cda1cf4d41a0dbf",
    "67cacfe50cda1cf4d41a0dc2",
    "67cacfe50cda1cf4d41a0dc5",
    "67cacfe50cda1cf4d41a0dc8",
    "67cacfe50cda1cf4d41a0dcb",
    "67cacfe50cda1cf4d41a0dce",
    "67cacfe50cda1cf4d41a0dd1",
    "67cacfe50cda1cf4d41a0dd4",
    "67cacfe50cda1cf4d41a0dd7",
    "67cacfe50cda1cf4d41a0dd9",
    "67cacfe50cda1cf4d41a0ddb",
  ],
  "Zeal Entertainment": [
    "67cacff20cda1cf4d41a0dfd",
    "67cacff20cda1cf4d41a0e07",
    "67cacff20cda1cf4d41a0e10",
    "67cacff20cda1cf4d41a0e1d",
    "67cacff20cda1cf4d41a0e26",
    "67cacff20cda1cf4d41a0e2b",
    "67cacff20cda1cf4d41a0e32",
    "67cacff20cda1cf4d41a0e37",
    "67cacff20cda1cf4d41a0e3a",
    "67cacff20cda1cf4d41a0e3f",
    "67cacff20cda1cf4d41a0e47",
    "67cacff20cda1cf4d41a0e4b",
  ],
  "Zeal Lifestyle": [
    "67cacffc0cda1cf4d41a0e5c",
    "67cacffc0cda1cf4d41a0e5f",
    "67cacffc0cda1cf4d41a0e62",
    "67cacffc0cda1cf4d41a0e69",
    "67cacffc0cda1cf4d41a0e6e",
    "67cacffc0cda1cf4d41a0e71",
    "67cacffc0cda1cf4d41a0e74",
    "67cacffc0cda1cf4d41a0e77",
    "67cacffc0cda1cf4d41a0e7a",
    "67cacffc0cda1cf4d41a0e7d",
    "67cacffc0cda1cf4d41a0e80",
    "67cacffc0cda1cf4d41a0e83",
    "67cacffc0cda1cf4d41a0e86",
    "67cacffc0cda1cf4d41a0e8a",
    "67cacffc0cda1cf4d41a0e8d",
    "67cacffc0cda1cf4d41a0e91",
    "67cacffc0cda1cf4d41a0e94",
    "67cacffc0cda1cf4d41a0e97",
    "67cacffc0cda1cf4d41a0e9a",
    "67cacffc0cda1cf4d41a0e9d",
  ],
  "Zeal Tech": [
    "67cad0070cda1cf4d41a0eb6",
    "67cad0070cda1cf4d41a0eb9",
    "67cad0070cda1cf4d41a0ebc",
    "67cad0070cda1cf4d41a0ebf",
    "67cad0070cda1cf4d41a0ec1",
    "67cad0070cda1cf4d41a0ec4",
    "67cad0070cda1cf4d41a0ec7",
    "67cad0070cda1cf4d41a0eca",
    "67cad0070cda1cf4d41a0ece",
    "67cad0070cda1cf4d41a0ed1",
    "67cad0070cda1cf4d41a0ed4",
    "67cad0070cda1cf4d41a0ed8",
    "67cad0070cda1cf4d41a0ede",
    "67cad0070cda1cf4d41a0ee1",
    "67cad0070cda1cf4d41a0ee4",
    "67cad0070cda1cf4d41a0ee8",
    "67cad0070cda1cf4d41a0eeb",
    "67cad0070cda1cf4d41a0eee",
    "67cad0070cda1cf4d41a0ef1",
    "67cad0070cda1cf4d41a0ef4",
  ],
  "Zeal Sports": [
    "67cad0110cda1cf4d41a0f0d",
    "67cad0110cda1cf4d41a0f12",
    "67cad0110cda1cf4d41a0f17",
    "67cad0110cda1cf4d41a0f1b",
    "67cad0110cda1cf4d41a0f1f",
    "67cad0110cda1cf4d41a0f23",
    "67cad0110cda1cf4d41a0f26",
    "67cad0110cda1cf4d41a0f29",
    "67cad0110cda1cf4d41a0f2c",
    "67cad0110cda1cf4d41a0f30",
    "67cad0110cda1cf4d41a0f33",
    "67cad0110cda1cf4d41a0f38",
    "67cad0110cda1cf4d41a0f3b",
    "67cad0110cda1cf4d41a0f3f",
    "67cad0110cda1cf4d41a0f43",
    "67cad0110cda1cf4d41a0f47",
    "67cad0110cda1cf4d41a0f4b",
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
