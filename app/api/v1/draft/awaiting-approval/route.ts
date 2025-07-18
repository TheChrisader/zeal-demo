import { NextRequest, NextResponse } from "next/server";
import { getDraftsByUserId } from "@/database/draft/draft.repository";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import { INTERNAL_ERROR } from "@/utils/error/error-codes";

export const GET = async (req: NextRequest) => {
  try {
    await connectToDatabase();
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    const drafts = await getDraftsByUserId(user.id, "awaiting_approval");

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
