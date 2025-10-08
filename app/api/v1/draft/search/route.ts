import { NextRequest, NextResponse } from "next/server";
import { searchDraftsByUser } from "@/database/draft/draft.repository";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import { INTERNAL_ERROR } from "@/utils/error/error-codes";

export const GET = async (req: NextRequest) => {
  try {
    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const searchQuery = searchParams.get("q") || "";
    const page = Number(searchParams.get("page")) || 1;

    if (!searchQuery.trim()) {
      return NextResponse.json([]);
    }

    const drafts = await searchDraftsByUser(
      user.id,
      searchQuery,
      { skip: (page - 1) * 5, limit: 5 }
    );

    return NextResponse.json(drafts);
  } catch (error) {
    return sendError(
      buildError({
        code: INTERNAL_ERROR,
        message: error instanceof Error ? error.message : "An error occurred while searching drafts.",
        status: 500,
        data: error,
      }),
    );
  }
};