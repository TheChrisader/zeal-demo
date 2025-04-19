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
    "680361c363ba8a8edf2b105e",
    "680361c363ba8a8edf2b1062",
    "680361c363ba8a8edf2b1066",
    "680361c363ba8a8edf2b1069",
    "680361c363ba8a8edf2b1070",
    "680361c363ba8a8edf2b1075",
    "680361c363ba8a8edf2b107b",
    "680361c363ba8a8edf2b1080",
    "680361c363ba8a8edf2b1084",
    "680361c363ba8a8edf2b1089",
    "680361c363ba8a8edf2b1090",
    "680361c363ba8a8edf2b1097",
    "680361c363ba8a8edf2b109a",
    "680361c363ba8a8edf2b109d",
    "680361c363ba8a8edf2b10a0",
    "680361c363ba8a8edf2b10a3",
    "680361c363ba8a8edf2b10a6",
    "680361c363ba8a8edf2b10a9",
    "680361c363ba8a8edf2b10ad",
    "680361c363ba8a8edf2b10b0",
    "680361c363ba8a8edf2b10b2",
    "680361c363ba8a8edf2b10b4",
    "680361c363ba8a8edf2b10b6",
    "680361c363ba8a8edf2b10b8",
    "680361c363ba8a8edf2b10ba",
  ],
  "Zeal Global": [
    "680361d363ba8a8edf2b10d7",
    "680361d363ba8a8edf2b10da",
    "680361d363ba8a8edf2b10de",
    "680361d363ba8a8edf2b10e3",
    "680361d363ba8a8edf2b10e6",
    "680361d363ba8a8edf2b10e8",
    "680361d363ba8a8edf2b10ea",
    "680361d363ba8a8edf2b10ec",
    "680361d363ba8a8edf2b10ee",
    "680361d363ba8a8edf2b10f0",
  ],
  "Zeal Entertainment": [
    "680361eb63ba8a8edf2b10fe",
    "680361eb63ba8a8edf2b1109",
    "680361eb63ba8a8edf2b110b",
    "680361eb63ba8a8edf2b1113",
    "680361eb63ba8a8edf2b1115",
    "680361eb63ba8a8edf2b1118",
    "680361eb63ba8a8edf2b111d",
    "680361eb63ba8a8edf2b111f",
    "680361eb63ba8a8edf2b1127",
    "680361eb63ba8a8edf2b112c",
  ],
  "Business 360": [
    "680361ff63ba8a8edf2b113a",
    "680361ff63ba8a8edf2b113d",
    "680361ff63ba8a8edf2b1141",
    "680361ff63ba8a8edf2b1143",
    "680361ff63ba8a8edf2b1146",
    "680361ff63ba8a8edf2b1149",
    "680361ff63ba8a8edf2b114c",
    "680361ff63ba8a8edf2b114f",
    "680361ff63ba8a8edf2b1155",
    "680361ff63ba8a8edf2b1157",
    "680361ff63ba8a8edf2b1159",
  ],
  "Zeal Lifestyle": [
    "6803621563ba8a8edf2b1168",
    "6803621563ba8a8edf2b116a",
    "6803621563ba8a8edf2b116c",
    "6803621563ba8a8edf2b116f",
    "6803621563ba8a8edf2b1171",
    "6803621563ba8a8edf2b1173",
  ],
  "Zeal Tech": [
    "6803622a63ba8a8edf2b117d",
    "6803622a63ba8a8edf2b117f",
    "6803622a63ba8a8edf2b1182",
    "6803622a63ba8a8edf2b1184",
    "6803622a63ba8a8edf2b1187",
    "6803622a63ba8a8edf2b1189",
    "6803622a63ba8a8edf2b118d",
    "6803622a63ba8a8edf2b118f",
    "6803622a63ba8a8edf2b1191",
    "6803622a63ba8a8edf2b1194",
    "6803622a63ba8a8edf2b1196",
    "6803622a63ba8a8edf2b119a",
    "6803622a63ba8a8edf2b119c",
    "6803622a63ba8a8edf2b119e",
    "6803622a63ba8a8edf2b11a0",
  ],
  "Zeal Sports": [
    "6803624263ba8a8edf2b11b3",
    "6803624263ba8a8edf2b11b8",
    "6803624263ba8a8edf2b11bb",
    "6803624263ba8a8edf2b11bf",
    "6803624263ba8a8edf2b11c4",
    "6803624263ba8a8edf2b11c6",
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
