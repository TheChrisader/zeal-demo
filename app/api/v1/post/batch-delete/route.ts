import { NextRequest, NextResponse } from "next/server";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import { INTERNAL_ERROR, INVALID_REQUEST } from "@/utils/error/error-codes";
import PostModel from "@/database/post/post.model";

export const DELETE = async (req: NextRequest) => {
  try {
    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { postIds } = body;

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return sendError(
        buildError({
          code: INVALID_REQUEST,
          message: "Post IDs array is required",
          status: 400,
        })
      );
    }

    // Delete posts that belong to the user
    const result = await PostModel.deleteMany({
      _id: { $in: postIds },
      author_id: user._id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "No posts found to delete" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Posts deleted successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    return sendError(
      buildError({
        code: INTERNAL_ERROR,
        message: error instanceof Error ? error.message : "An error occurred while deleting posts.",
        status: 500,
        data: error,
      }),
    );
  }
};