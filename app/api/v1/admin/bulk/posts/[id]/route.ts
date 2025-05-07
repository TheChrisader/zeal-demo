import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import ReactionModel from "@/database/reaction/reaction.model";
import { connectToDatabase, newId } from "@/lib/database";

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

    await ReactionModel.deleteOne({ post_id: newId(post._id) });

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

export async function PUT(
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

    const updateData = await req.json();

    // Basic validation: ensure there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Request body cannot be empty",
        },
        { status: 400 },
      );
    }

    // Prevent updating _id or other immutable fields if necessary
    delete updateData._id;

    const updatedPost = await PostModel.findByIdAndUpdate(
      params.id,
      { $set: updateData }, // Use $set to update only provided fields
      { new: true, runValidators: true }, // Return the updated document and run schema validators
    ).lean();

    if (!updatedPost) {
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
        data: updatedPost,
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("Post Update API Error:", error);
    // Handle potential validation errors from Mongoose
    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          status: "error",
          message: "Validation failed",
          errors: error.errors,
        },
        { status: 400 },
      );
    }
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
