import { NextRequest, NextResponse } from "next/server";
import {
  checkDislike,
  createDislike,
  deleteDislikeByUserId,
} from "@/database/dislike/dislike.repository";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase, newId } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import { INTERNAL_ERROR } from "@/utils/error/error-codes";

export const POST = async (
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

    const isDisliked = await checkDislike(user.id, id);

    if (isDisliked) {
      await deleteDislikeByUserId(user.id, id);
      return NextResponse.json({ message: "Dislike removed" });
    }

    await createDislike(user.id, id);

    return NextResponse.json({ message: "Dislike created" });
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

    await deleteDislikeByUserId(user.id, id);

    return NextResponse.json({ message: "Dislike deleted" });
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
