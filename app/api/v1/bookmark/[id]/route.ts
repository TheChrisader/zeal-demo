import { NextRequest, NextResponse } from "next/server";
import {
  checkBookmark,
  createBookmark,
  deleteBookmarkByUserId,
} from "@/database/bookmark/bookmark.repository";
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

    const isBookmarked = await checkBookmark(user.id, id);

    if (isBookmarked) {
      await deleteBookmarkByUserId(user.id, id);
      return NextResponse.json({ message: "Bookmark removed" });
    }

    await createBookmark(user.id, id);

    return NextResponse.json({ message: "Bookmark created" });
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

    await deleteBookmarkByUserId(user.id, id);

    return NextResponse.json({ message: "Bookmark deleted" });
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
