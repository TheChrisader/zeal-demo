import { NextRequest, NextResponse } from "next/server";
import {
  deleteDraftById,
  getDraftById,
  updateDraft,
} from "@/database/draft/draft.repository";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import { INTERNAL_ERROR } from "@/utils/error/error-codes";

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    await connectToDatabase();
    const { user } = await serverAuthGuard();

    const draftUpdate = await req.json();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" });
    }

    const { id } = params;

    const draft = await getDraftById(id);

    if (draft?.user_id.toString() !== user.id.toString()) {
      return NextResponse.json({ message: "Access Forbidden" });
    }

    await updateDraft(id, draftUpdate);

    return NextResponse.json({ message: "Draft updated" });
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

    await deleteDraftById(id);

    return NextResponse.json({ message: "Draft deleted" });
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
