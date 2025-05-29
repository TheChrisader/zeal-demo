import { NextRequest, NextResponse } from "next/server";
import {
  deleteDraftById,
  getDraftById,
  updateDraft,
} from "@/database/draft/draft.repository";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import {
  FILE_TOO_LARGE_ERROR,
  INTERNAL_ERROR,
  WRONG_FILE_FORMAT_ERROR,
} from "@/utils/error/error-codes";
import { IDraft } from "@/types/draft.type";
import { uploadImageToS3 } from "@/lib/bucket";
import {
  AUTHORIZED_IMAGE_MIME_TYPES,
  AUTHORIZED_IMAGE_SIZE,
} from "@/utils/file.utils";
import { formDataToJson } from "@/utils/converter.utils";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" });
    }

    const { id } = params;

    const draft = await getDraftById(id);

    if (draft?.user_id.toString() !== user.id.toString()) {
      return NextResponse.json({ message: "Access Forbidden" });
    }

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

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    const formData = await req.formData();

    if (!formData) {
      return NextResponse.json({ message: "Post body cannot be empty" });
    }

    const updatedDraft = formDataToJson(formData);

    const file = formData.get("image") as (Blob & { name: string }) | null;

    if (Object.keys(updatedDraft).length === 0 && !file) {
      return NextResponse.json(
        {
          status: "error",
          message: "Request body cannot be empty",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" });
    }

    const { id } = params;

    const draft = await getDraftById(id);

    if (!draft) {
      return NextResponse.json({ message: "Draft not found" });
    }

    if (draft?.user_id.toString() !== user.id.toString()) {
      return NextResponse.json({ message: "Access Forbidden" });
    }

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

      const image_url = `${process.env.CLOUDFRONT_BASE_URL}/${photoKey}`;

      updatedDraft.image_url = image_url;
    }

    delete updatedDraft.user_id;
    delete updatedDraft._id;

    const newDraft = await updateDraft(id, updatedDraft);

    return NextResponse.json(newDraft);
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

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" });
    }

    const { id } = params;

    const draft = await getDraftById(id);

    if (draft?.user_id.toString() !== user.id.toString()) {
      return NextResponse.json({ message: "Access Forbidden" });
    }

    const deletedDraft = await deleteDraftById(id);

    return NextResponse.json(deletedDraft);
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
