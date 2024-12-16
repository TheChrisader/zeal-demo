import { NextRequest, NextResponse } from "next/server";
import {
  createComment,
  getCommentById,
  updateReplyCount,
} from "@/database/comment/comment.repository";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase, newId } from "@/lib/database";
import CommentModel from "@/database/comment/comment.model";

interface QueryParams {
  parent_id?: string;
  page?: number;
  limit?: number;
  skip?: number;
}

export const GET = async (
  request: NextRequest,
  { params }: { params: { article_id: string } },
) => {
  try {
    await connectToDatabase();
    const searchParams = request.nextUrl.searchParams;

    const queryParams: QueryParams = {
      parent_id: searchParams.get("parent_id") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      skip: (parseInt(searchParams.get("page") || "1") - 1) * 10,
    };

    const query = {
      article_id: params.article_id,
      parent_id: queryParams.parent_id || null,
      is_deleted: false,
    };

    const [comments, total] = await Promise.all([
      CommentModel.find(query)
        .sort({ created_at: -1 })
        .skip(queryParams.skip!)
        .limit(queryParams.limit!)
        .populate("user_id", "username display_name avatar")
        .lean(),
      CommentModel.countDocuments(query),
    ]);

    return NextResponse.json({
      comments,
      pagination: {
        total,
        pages: Math.ceil(total / queryParams.limit!),
        current: queryParams.page,
      },
    });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
};

export const POST = async (request: NextRequest) => {
  try {
    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    const comment: {
      content: string;
      article_id: string;
      user_id: string;
      parent_id: string | null;
    } = await request.json();

    if (!comment?.content?.trim()) {
      return NextResponse.json(
        { message: "Content is required." },
        { status: 400 },
      );
    }

    if (!comment.user_id || user.id.toString() != comment.user_id) {
      return NextResponse.json(
        { message: "Access Forbidden" },
        { status: 403 },
      );
    }

    let depth = 0;

    if (comment.parent_id) {
      const parentComment = await getCommentById(comment.parent_id);

      if (!parentComment) {
        return NextResponse.json(
          { message: "Parent comment not found." },
          { status: 404 },
        );
      }

      depth = parentComment.depth + 1;

      if (depth > 10) {
        return NextResponse.json(
          { message: "Maximum depth reached." },
          { status: 400 },
        );
      }

      await updateReplyCount(comment.parent_id, parentComment.reply_count + 1);
    }

    const createdComment = await createComment({
      ...comment,
      parent_id: comment.parent_id ? newId(comment.parent_id) : null,
      depth,
      reply_count: 0,
    });

    return NextResponse.json(createdComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }
};
