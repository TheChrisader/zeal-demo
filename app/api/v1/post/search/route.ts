import { NextRequest, NextResponse } from "next/server";
import { searchPostsByAuthor } from "@/database/post/post.repository";
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
    const authorId = searchParams.get("authorId");
    const page = Number(searchParams.get("page")) || 1;

    if (!authorId) {
      return NextResponse.json({ message: "Author ID is required" }, { status: 400 });
    }

    if (!searchQuery.trim()) {
      return NextResponse.json([]);
    }

    const posts = await searchPostsByAuthor(
      authorId,
      searchQuery,
      { skip: (page - 1) * 5, limit: 5 }
    );

    return NextResponse.json(posts);
  } catch (error) {
    return sendError(
      buildError({
        code: INTERNAL_ERROR,
        message: error instanceof Error ? error.message : "An error occurred while searching posts.",
        status: 500,
        data: error,
      }),
    );
  }
};