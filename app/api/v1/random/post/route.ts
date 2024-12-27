import PostModel from "@/database/post/post.model";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const post = await PostModel.aggregate([
      { $sample: { size: 1 } },
      { $project: { slug: 1, _id: 0 } },
    ]);

    if (!post.length) {
      return NextResponse.json({ error: "No posts found" }, { status: 404 });
    }

    return NextResponse.json({ slug: post[0].slug });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
