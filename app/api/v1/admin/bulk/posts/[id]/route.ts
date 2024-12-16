import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import { connectToDatabase } from "@/lib/database";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid post ID format",
        },
        { status: 400 },
      );
    }

    const post = await PostModel.findById(params.id).lean();

    if (!post) {
      return NextResponse.json(
        {
          status: "error",
          message: "Post not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        status: "success",
        data: post,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      },
    );
  } catch (error) {
    console.error("Post API Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid post ID format",
        },
        { status: 400 },
      );
    }

    const post = await PostModel.findByIdAndDelete(params.id);

    if (!post) {
      return NextResponse.json(
        {
          status: "error",
          message: "Post not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        status: "success",
        data: post,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      },
    );
  } catch (error) {
    console.error("Post API Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      {
        status: 500,
      },
    );
  }
}
