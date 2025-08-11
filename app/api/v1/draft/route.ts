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
  ImageValidationError,
  validateAndUploadImage,
} from "@/utils/file.utils";
import { uploadImageToS3 } from "@/lib/bucket";
import { IDraft } from "@/types/draft.type";
import { formDataToJson } from "@/utils/converter.utils";

export const GET = async (req: NextRequest) => {
  try {
    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = Number(searchParams.get("page")) || 1;

    const drafts = await getDraftsByUserId(user.id, { skip: (page - 1) * 10 });

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

    const newDraft = formDataToJson(formData);

    if (!newDraft.title) {
      return NextResponse.json({ message: "Title cannot be empty" });
    }

    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" });
    }

    const file = formData.get("image") as (Blob & { name: string }) | null;

    if (file) {
      try {
        const key = await validateAndUploadImage(file, "posts/");
        newDraft.image_url = `${process.env.CLOUDFRONT_BASE_URL}/${key}`;
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

    const draft = await createDraft({ user_id: user.id, ...newDraft });

    return NextResponse.json(draft);
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
