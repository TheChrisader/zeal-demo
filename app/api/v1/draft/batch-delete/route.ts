import { NextRequest, NextResponse } from "next/server";
import DraftModel from "@/database/draft/draft.model";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import { INTERNAL_ERROR } from "@/utils/error/error-codes";

export const DELETE = async (req: NextRequest) => {
  try {
    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { draftIds } = body;

    if (!draftIds || !Array.isArray(draftIds) || draftIds.length === 0) {
      return sendError(
        buildError({
          code: "Invalid Request",
          message: "Draft IDs array is required",
          status: 400,
        }),
      );
    }

    // Delete drafts that belong to the user
    const result = await DraftModel.deleteMany({
      _id: { $in: draftIds },
      user_id: user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "No drafts found to delete" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Drafts deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return sendError(
      buildError({
        code: INTERNAL_ERROR,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting drafts.",
        status: 500,
        data: error,
      }),
    );
  }
};
