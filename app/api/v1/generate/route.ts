import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import BatchModel from "@/database/batch/batch.model";
import { stripHtml } from "string-strip-html";

export const POST = async (request: NextRequest) => {
  try {
    const schema = {
      description: "Article generated",
      type: SchemaType.OBJECT,
      properties: {
        summary: {
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

    const existingBatches = await BatchModel.find({
      // updated_at: {
      //   $gte: new Date(new Date().setHours(new Date().getHours() - 6)),
      //   $lt: new Date(),
      // },
    })
      .limit(1)
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
    Read, and write a lengthy article based on the following articles:
    ${content}
    `;

      const result = await model.generateContent(prompt);
      console.log(JSON.parse(result.response.text()));
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
