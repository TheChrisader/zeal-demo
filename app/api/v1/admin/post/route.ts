import { NextRequest, NextResponse } from "next/server";
import { createPost } from "@/database/post/post.repository";
import { createReaction } from "@/database/reaction/reaction.repository";
import { uploadImageToS3 } from "@/lib/bucket";
import { connectToDatabase } from "@/lib/database";
import { IPost } from "@/types/post.type";
import {
  AUTHORIZED_IMAGE_MIME_TYPES,
  AUTHORIZED_IMAGE_SIZE,
} from "@/utils/file.utils";
import { calculateReadingTime } from "@/utils/post.utils";

function generateRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

export const POST = async (request: NextRequest) => {
  try {
    const formData = await request.formData();

    if (!formData) {
      return NextResponse.json({ message: "Post body cannot be empty" });
    }

    await connectToDatabase();

    const file = formData.get("image") as (Blob & { name: string }) | null;

    let image_url: string | undefined = undefined;

    if (file) {
      if (!AUTHORIZED_IMAGE_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { message: "Wrong file format." },
          { status: 422 },
        );
      }

      if (file.size > AUTHORIZED_IMAGE_SIZE) {
        return NextResponse.json(
          { message: "File too large." },
          { status: 422 },
        );
      }

      const photoKey = await uploadImageToS3(file, "posts/");

      if (!photoKey) {
        return NextResponse.json({ error: "Failed to upload image." });
      }

      image_url = `${process.env.CLOUDFRONT_BASE_URL}/${photoKey}`;
    }

    const post: Partial<IPost> = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      category: [formData.get("category") as string],
      description: formData.get("description") as string,
      country: [formData.get("country") as string],
      external: formData.get("external") ? true : false,
      keywords: formData.get("keywords")
        ? (formData.get("keywords") as string).split(",")
        : [],
      language: (formData.get("language") as "English" | "French") || "English",
      published: true,
      // published_at: new Date(),
      link:
        (formData.get("link") as string) ||
        `httyd://${generateRandomString(10)}`,
      author_id: formData.get("author") as string,
      source: {
        name: formData.get("source_name") as string,
        icon: (formData.get("source_icon") as string) || undefined,
        url: formData.get("source_url") as string,
        id: formData.get("source_id") as string,
      },
      image_url,
      top_feature:
        formData.get("topFeature") === "true"
          ? new Date().toISOString()
          : undefined,
      status: "active",
      ttr: calculateReadingTime(formData.get("content") as string),
    };

    const createdPost = await createPost(post);

    await createReaction(createdPost._id!);

    return NextResponse.json(createdPost._id?.toString(), { status: 201 });
  } catch (error) {
    console.log("Admin Post API error: ", error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
};
