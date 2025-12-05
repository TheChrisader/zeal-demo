import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import PostModel from "@/database/post/post.model";
import { connectToDatabase } from "@/lib/database";

const SearchRequestSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query too long"),
});

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { query } = SearchRequestSchema.parse(body);
    console.log(query);

    await connectToDatabase();

    const posts = await PostModel.find(
      {
        $and: [
          {
            $or: [
              { title: { $regex: query, $options: "i" } },
              { $text: { $search: query } },
            ],
          },
          { status: "active" },
        ],
      },
      {
        title: 1,
        slug: 1,
        image_url: 1,
        description: 1,
        published_at: 1,
        category: { $arrayElemAt: ["$category", 0] },
        _id: 1,
      },
    )
      .sort({ published_at: -1 })
      .limit(10)
      .lean({ virtuals: true });

    return NextResponse.json({
      success: true,
      data: posts,
      count: posts.length,
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: error.errors,
        },
        { status: 422 },
      );
    }
    console.error("Error searching posts:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
};
