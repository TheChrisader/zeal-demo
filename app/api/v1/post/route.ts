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
  ImageValidationError,
  validateAndUploadImage,
} from "@/utils/file.utils";
import { calculateReadingTime } from "@/utils/post.utils";
import { SlugGenerator } from "@/lib/slug";
import { generateRandomString } from "@/lib/utils";
import { formDataToJson } from "@/utils/converter.utils";
import { calculateInitialScore } from "@/lib/scoring";

// export interface ImageValidationError {
//   message: string;
//   status: number;
// }

// TODO: Delete Draft if it exists

export const POST = async (request: NextRequest) => {
  try {
    const slugGenerator = new SlugGenerator();
    const formData = await request.formData();

    if (!formData) {
      return NextResponse.json({ message: "Post body cannot be empty" });
    }

    const postData = formDataToJson<IPost>(formData);

    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" });
    }

    const file = formData.get("image") as
      | (Blob & { name: string })
      | string
      | null;

    let image_url: string | undefined = undefined;

    if (file) {
      if (typeof file === "string") {
        image_url = file;
      } else {
        try {
          const key = await validateAndUploadImage(file, "posts/");
          image_url = `${process.env.CLOUDFRONT_BASE_URL}/${key}`;
        } catch (error) {
          console.error(`Error uploading image: ${error}`);
          if (error instanceof ImageValidationError) {
            return NextResponse.json(
              { message: error.message },
              { status: error.status },
            );
          }
          return NextResponse.json(
            { message: "Error uploading image" },
            { status: 500 },
          );
        }
      }
    }

    // const { title, content, category, keywords, source_type } = postData;

    // --- SCORING LOGIC INTEGRATION ---
    // 1. Prepare the data for the scoring function
    // const newPostData = { content, keywords, image_url, source_type };

    // // 2. Call the heavy, one-time scoring function
    // const { initial_score, prominence_score } =
    //   await calculateInitialScore(newPostData);

    const post: Partial<IPost> = {
      title: formData.get("title") as string,
      slug: slugGenerator.generate(formData.get("title") as string),
      content: formData.get("content") as string,
      description: formData.get("description") as string,
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
      image_url: image_url || (formData.get("image_url") as string),
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
