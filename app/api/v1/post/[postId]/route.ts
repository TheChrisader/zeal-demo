import { NextRequest, NextResponse } from "next/server";
import { getPostById } from "@/database/post/post.repository";
import { connectToDatabase, newId } from "@/lib/database";
import { Types } from "mongoose";
import PostModel from "@/database/post/post.model";
import ReactionModel from "@/database/reaction/reaction.model";
import { formDataToJson } from "@/utils/converter.utils";
import {
  AUTHORIZED_IMAGE_MIME_TYPES,
  AUTHORIZED_IMAGE_SIZE,
  ImageValidationError,
  validateAndUploadImage,
} from "@/utils/file.utils";
import { uploadImageToS3 } from "@/lib/bucket";

export async function GET(
  req: Request,
  { params }: { params: { postId: string } },
) {
  try {
    const postId = params.postId;

    if (!postId) {
      return new NextResponse("Post ID is required", { status: 400 });
    }

    await connectToDatabase();

    const post = await getPostById(postId);

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.log(`Error getting post: ${error}`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } },
) {
  try {
    await connectToDatabase();

    if (!Types.ObjectId.isValid(params.postId)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid post ID format",
        },
        { status: 400 },
      );
    }

    const post = await PostModel.findByIdAndDelete(params.postId);

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

    return NextResponse.json(post, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { postId: string } },
) {
  try {
    await connectToDatabase();

    if (!Types.ObjectId.isValid(params.postId)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid post ID format",
        },
        { status: 400 },
      );
    }

    const updateFormData = await req.formData();
    // const updateData = Object.fromEntries(updateFormData);
    // const updateData = Object.fromEntries(updateFormData.entries());
    const updateData = formDataToJson(updateFormData);
    const file = updateFormData.get("image") as
      | (Blob & { name: string })
      | null;

    // Basic validation: ensure there's something to update
    if (Object.keys(updateData).length === 0 && !file) {
      return NextResponse.json(
        {
          status: "error",
          message: "Request body cannot be empty",
        },
        { status: 400 },
      );
    }

    if (file) {
      try {
        const key = await validateAndUploadImage(file, "posts/");
        updateData.image_url = `${process.env.CLOUDFRONT_BASE_URL}/${key}`;
      } catch (error) {
        console.error(`Error uploading image: ${error}`);
        if (error instanceof ImageValidationError) {
          return NextResponse.json(
            { message: error.message },
            { status: error.status },
          );
        }
        return NextResponse.json(
          { message: "Error uploading image" },
          { status: 500 },
        );
      }
    }

    // Prevent updating _id or other immutable fields if necessary
    delete updateData._id;
    console.log(updateData);

    const updatedPost = await PostModel.findByIdAndUpdate(
      params.postId,
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

    return NextResponse.json(updatedPost, {
      status: 200,
    });
  } catch (error) {
    console.error("Post Update API Error:", error);
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
