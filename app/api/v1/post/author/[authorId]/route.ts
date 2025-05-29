import { NextRequest, NextResponse } from "next/server";
import { getPostsByAuthorId } from "@/database/post/post.repository";
import { IPost } from "@/types/post.type";

export async function GET(
  request: NextRequest,
  { params }: { params: { authorId: string } },
) {
  try {
    const { authorId } = params;

    if (!authorId) {
      return NextResponse.json(
        { message: "Author ID is required" },
        { status: 400 },
      );
    }

    const posts: IPost[] = await getPostsByAuthorId(authorId);

    if (!posts || posts.length === 0) {
      return NextResponse.json(
        { message: "No posts found for this author" },
        { status: 404 },
      );
    }

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts by author ID:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
