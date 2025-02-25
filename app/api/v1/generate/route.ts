import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import BatchModel from "@/database/batch/batch.model";
import { stripHtml } from "string-strip-html";
import { SlugGenerator } from "@/lib/slug";
import { generateRandomString } from "@/lib/utils";
import { calculateReadingTime } from "@/utils/post.utils";
import { IPost } from "@/types/post.type";

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

    const existingBatches = await BatchModel.find({
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
        .select("content")
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
        author_id: "Zeal News Studio",
        content: result.article,
        description: result.preview,
        link: `httyd://${generateRandomString(10)}`,
        ttr: calculateReadingTime(result.article),
        category: ["Zeal News Studio"],
        external: false,
        published: true,
        keywords: result.keywords,
        source: {
          name: "Zeal News Studio",
          icon: "/favicon.ico",
        },
      });
      // existingBatch.summary = result.summary;
      // await existingBatch.save();
    }
    const createdPosts = await PostModel.create(posts);

    // const prompt = `
    // Pre: Be extremely strict, detailed, and cautiously specific. Think carefully before responding, and recheck your work.
    // Instructions:
    // Fetch, read, and write a summary of the linked article:
    // https://dailytrust.com/breaking-abiola-won-june-12-election-ibb
    // `;

    // const result = await model.generateContent(prompt);
    // return NextResponse.json(result.response.text());
    return NextResponse.json(createdPosts);
    // JSON.parse(result.response.text());
  } catch (error) {
    console.log(`Error categorizing post: ${error}`);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
};
