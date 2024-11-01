import { NextRequest, NextResponse } from "next/server";
import { createPost } from "@/database/post/post.repository";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import {
  FILE_TOO_LARGE_ERROR,
  INTERNAL_ERROR,
  WRONG_FILE_FORMAT_ERROR,
} from "@/utils/error/error-codes";
import { IPost } from "@/types/post.type";
import {
  AUTHORIZED_IMAGE_MIME_TYPES,
  AUTHORIZED_IMAGE_SIZE,
} from "@/utils/file.utils";
import { uploadImageToS3 } from "@/lib/bucket";
import { calculateReadingTime } from "@/utils/post.utils";

// TODO: Delete Draft if it exists

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
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" });
    }

    const file = formData.get("image") as (Blob & { name: string }) | null;

    let image_url: string | undefined = undefined;

    if (file) {
      if (!AUTHORIZED_IMAGE_MIME_TYPES.includes(file.type)) {
        return sendError(
          buildError({
            code: WRONG_FILE_FORMAT_ERROR,
            message: "Wrong file format.",
            status: 422,
          }),
        );
      }

      if (file.size > AUTHORIZED_IMAGE_SIZE) {
        return sendError(
          buildError({
            code: FILE_TOO_LARGE_ERROR,
            message: "The file is too large.",
            status: 422,
          }),
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
      country: [user.country as string],
      external: false,
      language: "English",
      published: true,
      published_at: new Date().toISOString(),
      link: `httyd://${generateRandomString(10)}`,
      author_id: user.id,
      source: {
        name: user.display_name,
        icon: user.avatar || undefined,
        url: "",
        id: user.username,
      },
      image_url,
      ttr: calculateReadingTime(formData.get("content") as string),
    };

    const createdPost = await createPost(post);

    return NextResponse.json(createdPost);
  } catch (error) {
    return sendError(
      buildError({
        code: INTERNAL_ERROR,
        message: error instanceof Error ? error.message : "An error occured.",
        status: 500,
        data: error,
      }),
    );
  }
};
