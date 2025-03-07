import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import BatchModel from "@/database/batch/batch.model";
import PostModel from "@/database/post/post.model";
import { Id } from "@/lib/database";
import { IBatch, IBatchArticle } from "@/types/batch.type";

export const POST = async () => {
  const batchResults: { [key: string]: Id[] } = {};
  const categories: { title: string; groups: string[] }[] = [
    { title: "Zeal Headline News", groups: ["Headlines"] },
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
    const schema = {
      description: "List of recipes",
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          batch: {
            type: SchemaType.STRING,
            description: "Descriptive and specific name of the batch",
            nullable: false,
          },
          articles: {
            type: SchemaType.ARRAY,
            description: "List of articles that fit under a batch",
            nullable: false,
            items: {
              type: SchemaType.STRING,
              description: "Title of the article",
              nullable: false,
            },
          },
        },
        // required: ["recipeName"],
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

    for (const category of categories) {
      const { title, groups } = category;

      const existingBatches = await BatchModel.find({
        category: title,
        //   updated_at: {
        //     $gte: new Date(new Date().setHours(new Date().getHours() - 6)),
        //   },
      })
        .select("_id name")
        .exec();

      const existingBatchesList = existingBatches.map((batch) => batch.name);

      const posts = await PostModel.find({
        category: {
          $in: groups,
        },
        //   country: {
        //     $in: ["Nigeria"],
        //   },
        published_at: {
          $gte: new Date(new Date().setHours(new Date().getHours() - 24)),
          $lt: new Date(),
        },
      })
        .select("_id title source slug link")
        .exec();

      const postsList = posts.map((post) => post.title).join(" \n");

      const prompt = `
    Pre: Be extremely strict, detailed, and cautiously specific. Think carefully before responding, and recheck your work.
    Instructions: 
    Batch these news articles based off if their titles indicate content referring to the same event. 
    Tend towards caution and disregard articles that do not fit clearly under a batch. 
    To qualify for a batch, there must be at least two articles. 
    If there are none, return an empty array.

    Existing Batches (Create new batches if necessary, disregard if no new articles fit):
    ${existingBatchesList.join(" \n")}
    
    Articles:
    ${postsList}
    `;

      const result = await model.generateContent(prompt);
      let generated_batches = [];
      try {
        generated_batches = JSON.parse(result.response.text());
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
          const existingBatch = await BatchModel.findOne({
            name: batch,
          }).exec();

          if (!existingBatch) {
            continue;
          }

          existingBatch.articles = [
            ...new Set([...existingBatch.articles, ...batchedArticles]),
          ];

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
          articles: batchedArticles,
        };

        batches.push(newBatch);
      }

      let createdBatches: IBatch[] = [];
      try {
        createdBatches = await BatchModel.create(batches, {
          ordered: false,
        });
      } catch {}

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
