import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import BatchModel from "@/database/batch/batch.model";
import { stripHtml } from "string-strip-html";

export const POST = async (request: NextRequest) => {
  try {
    const schema = {
      description: "Summary of articles",
      type: SchemaType.OBJECT,
      properties: {
        summary: {
          type: SchemaType.STRING,
          description: "Summary of the articles",
          nullable: false,
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

    const existingBatches = await BatchModel.find({})
      .select("_id name articles.id")
      .exec();

    for (const existingBatch of existingBatches) {
      const posts = await PostModel.find({
        _id: { $in: existingBatch.articles.map((a) => a.id) },
      })
        .select("content")
        .exec();
      const content = posts
        .map((post) => stripHtml(post.content).result)
        .join("\n\n");

      const prompt = `
    Pre: Be extremely strict, detailed, and cautiously specific. Think carefully before responding, and recheck your work.
    Instructions: 
    Read, and write a summary of the articles:
    ${content}
    `;

      const result = await model.generateContent(prompt);
      console.log(JSON.parse(result.response.text()).summary);
      existingBatch.summary = JSON.parse(result.response.text()).summary;
      await existingBatch.save();
    }

    // const prompt = `
    // Pre: Be extremely strict, detailed, and cautiously specific. Think carefully before responding, and recheck your work.
    // Instructions:
    // Fetch, read, and write a summary of the linked article:
    // https://dailytrust.com/breaking-abiola-won-june-12-election-ibb
    // `;

    // const result = await model.generateContent(prompt);
    // return NextResponse.json(result.response.text());
    return NextResponse.json("");
    // JSON.parse(result.response.text());
  } catch (error) {
    console.log(`Error categorizing post: ${error}`);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
};
