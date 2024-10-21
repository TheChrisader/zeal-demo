import { NextRequest, NextResponse } from "next/server";
import {
  createDraft,
  getDraftsByUserId,
} from "@/database/draft/draft.repository";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
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
import { uploadImageToS3 } from "@/lib/bucket";
import { IDraft } from "@/types/draft.type";

export const GET = async () => {
  try {
    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" });
    }

    const drafts = await getDraftsByUserId(user.id);

    return NextResponse.json(drafts);
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

    const draft: Partial<IDraft> = {
      user_id: user.id,
      title: formData.get("title") as string,
      content_hash: formData.get("content") as string,
      category: [formData.get("category") as string],
      image_url,
    };

    await createDraft(draft);

    return NextResponse.json({ message: "Draft created" });
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
