import { NextRequest, NextResponse } from "next/server";
import { getPostById, updatePost } from "@/database/post/post.repository";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { IPost } from "@/types/post.type";

export const PATCH = async (
  request: NextRequest,
  { params }: { params: { postId: string } },
) => {
  try {
    const { postId } = params;
    const { scheduled_at } = await request.json();

    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    // Get the post to check ownership
    const existingPost = await getPostById(postId);
    if (!existingPost || existingPost.author_id !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Update the scheduled time
    const updatedPost = await updatePost({
      ...existingPost,
      scheduled_at: new Date(scheduled_at),
      isScheduled: true,
    } as IPost);

    if (!updatedPost) {
      return NextResponse.json(
        { message: "Failed to update scheduled post" },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error(`Error updating scheduled post: ${error}`);
    return NextResponse.json(
      { message: "Error updating scheduled post" },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { postId: string } },
) => {
  try {
    const { postId } = params;

    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    // Get the post to check ownership
    const existingPost = await getPostById(postId);
    if (!existingPost || existingPost.author_id !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Cancel the scheduled post by removing scheduled properties
    const updatedPost = await updatePost({
      ...existingPost,
      scheduled_at: undefined,
      isScheduled: false,
    } as IPost);

    if (!updatedPost) {
      return NextResponse.json(
        { message: "Failed to cancel scheduled post" },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error(`Error canceling scheduled post: ${error}`);
    return NextResponse.json(
      { message: "Error canceling scheduled post" },
      { status: 500 },
    );
  }
};
