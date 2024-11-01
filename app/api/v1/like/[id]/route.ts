import { NextRequest, NextResponse } from "next/server";
import {
  checkLike,
  createLike,
  deleteLikeByUserId,
} from "@/database/like/like.repository";
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

    const isLiked = await checkLike(user.id, id);

    if (isLiked) {
      await deleteLikeByUserId(user.id, id);
      return NextResponse.json({ message: "Like removed" });
    }

    await createLike(user.id, id);

    return NextResponse.json({ message: "Like created" });
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

    await deleteLikeByUserId(user.id, id);

    return NextResponse.json({ message: "Like deleted" });
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
