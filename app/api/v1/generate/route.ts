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
    "67ef9761c87439816c6fe326",
    "67ef9761c87439816c6fe329",
    "67ef9761c87439816c6fe32b",
    "67ef9761c87439816c6fe32e",
    "67ef9761c87439816c6fe331",
  ],
  "Zeal Global": [
    "67ef976ac87439816c6fe33a",
    "67ef976ac87439816c6fe342",
    "67ef976ac87439816c6fe348",
    "67ef976ac87439816c6fe350",
    "67ef976ac87439816c6fe352",
  ],
  "Zeal Entertainment": [
    "67ef9775c87439816c6fe35c",
    "67ef9775c87439816c6fe360",
    "67ef9775c87439816c6fe364",
    "67ef9775c87439816c6fe369",
    "67ef9775c87439816c6fe36d",
    "67ef9775c87439816c6fe36f",
    "67ef9775c87439816c6fe373",
  ],
  "Business 360": [
    "67ef9784c87439816c6fe37e",
    "67ef9784c87439816c6fe395",
    "67ef9784c87439816c6fe39e",
    "67ef9785c87439816c6fe3a1",
    "67ef9785c87439816c6fe3a4",
    "67ef9785c87439816c6fe3a6",
    "67ef9785c87439816c6fe3a8",
  ],
  "Zeal Lifestyle": [
    "67ef978dc87439816c6fe3b4",
    "67ef978dc87439816c6fe3b7",
    "67ef978dc87439816c6fe3ba",
    "67ef978dc87439816c6fe3bc",
  ],
  "Zeal Tech": [
    "67ef979ac87439816c6fe3c4",
    "67ef979ac87439816c6fe3c5",
    "67ef979ac87439816c6fe3c8",
    "67ef979ac87439816c6fe3c9",
    "67ef979ac87439816c6fe3ca",
    "67ef979ac87439816c6fe3cb",
    "67ef979ac87439816c6fe3cd",
    "67ef979ac87439816c6fe3d1",
    "67ef979ac87439816c6fe3d2",
    "67ef979ac87439816c6fe3d6",
  ],
  "Zeal Sports": [
    "67ef97acc87439816c6fe3e6",
    "67ef97acc87439816c6fe3e9",
    "67ef97acc87439816c6fe3ec",
    "67ef97acc87439816c6fe3f0",
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
