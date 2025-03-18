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
    "67d9b355856aa9feae42163a",
    "67d9b355856aa9feae42163e",
    "67d9b355856aa9feae421641",
    "67d9b355856aa9feae421646",
    "67d9b355856aa9feae421649",
    "67d9b355856aa9feae42164d",
    "67d9b355856aa9feae421651",
    "67d9b355856aa9feae421655",
    "67d9b355856aa9feae421658",
    "67d9b355856aa9feae42165b",
    "67d9b355856aa9feae42165e",
    "67d9b355856aa9feae421661",
    "67d9b355856aa9feae421666",
  ],
  "Zeal Global": [
    "67d9b35b856aa9feae421679",
    "67d9b35b856aa9feae421681",
    "67d9b35b856aa9feae421685",
    "67d9b35b856aa9feae421689",
    "67d9b35b856aa9feae42168d",
    "67d9b35b856aa9feae421690",
    "67d9b35b856aa9feae421693",
    "67d9b35b856aa9feae421696",
    "67d9b35b856aa9feae421699",
  ],
  "Zeal Entertainment": [
    "67d9b360856aa9feae4216a8",
    "67d9b360856aa9feae4216ab",
    "67d9b360856aa9feae4216b4",
    "67d9b360856aa9feae4216b8",
    "67d9b360856aa9feae4216bb",
  ],
  "Zeal Tech": [
    "67d9b366856aa9feae4216c7",
    "67d9b366856aa9feae4216c9",
    "67d9b366856aa9feae4216cc",
    "67d9b366856aa9feae4216cf",
    "67d9b366856aa9feae4216d3",
    "67d9b366856aa9feae4216d7",
    "67d9b366856aa9feae4216da",
    "67d9b366856aa9feae4216dd",
    "67d9b366856aa9feae4216e2",
  ],
  "Zeal Sports": [
    "67d9b369856aa9feae4216f0",
    "67d9b369856aa9feae4216f6",
    "67d9b369856aa9feae4216f9",
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
