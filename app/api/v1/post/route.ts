import { NextRequest, NextResponse } from "next/server";
import { createPost } from "@/database/post/post.repository";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { uploadImageToS3 } from "@/lib/bucket";
import { connectToDatabase } from "@/lib/database";
import { IPost } from "@/types/post.type";
import { buildError, sendError } from "@/utils/error";
import {
  FILE_TOO_LARGE_ERROR,
  INTERNAL_ERROR,
  WRONG_FILE_FORMAT_ERROR,
} from "@/utils/error/error-codes";
import {
  AUTHORIZED_IMAGE_MIME_TYPES,
  AUTHORIZED_IMAGE_SIZE,
} from "@/utils/file.utils";
import { calculateReadingTime } from "@/utils/post.utils";
import { SlugGenerator } from "@/lib/slug";
import { generateRandomString } from "@/lib/utils";

// TODO: Delete Draft if it exists

export const POST = async (request: NextRequest) => {
  try {
    const slugGenerator = new SlugGenerator();
    const formData = await request.formData();

    if (!formData) {
      return NextResponse.json({ message: "Post body cannot be empty" });
    }

    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" });
    }

    const file = formData.get("image") as
      | (Blob & { name: string })
      | string
      | null;
    console.log("just file: ", file);

    let image_url: string | undefined = undefined;

    if (file) {
      if (typeof file === "string") {
        image_url = file;
      } else {
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
    }

    console.log("two of them: ", file, image_url);

    const post: Partial<IPost> = {
      title: formData.get("title") as string,
      slug: slugGenerator.generate(formData.get("title") as string),
      content: formData.get("content") as string,
      category: [formData.get("category") as string],
      country: formData.get("country")
        ? [formData.get("country") as string]
        : [user.country as string],
      external: formData.get("external") ? true : false,
      language: (formData.get("language") as "English" | "French") || "English",
      published: true,
      published_at: new Date().toISOString(),
      generatedBy: "user",
      link:
        (formData.get("link") as string) ||
        `httyd://${generateRandomString(10)}`,
      author_id: (formData.get("author") as string) || user.id,
      source: {
        name: (formData.get("source_name") as string) || user.display_name,
        icon:
          (formData.get("source_icon") as string) || user.avatar || undefined,
        url: (formData.get("source_url") as string) || "",
        id: (formData.get("source_id") as string) || user.username,
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
