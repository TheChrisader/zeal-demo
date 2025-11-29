import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { incrementPageViewsForCategories } from "@/database/page-stats/page-stats.repository";
import { connectToDatabase } from "@/lib/database";

// Zod schema for validating request body
const TrackPageViewSchema = z.object({
  slug: z.string().min(1, "Slug is required and cannot be empty"),
  categories: z.array(z.string().min(1, "Category cannot be empty")).min(1, "At least one category is required"),
  date: z.string().optional(), // Optional date parameter
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();

    const validationResult = TrackPageViewSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const { slug, categories, date } = validationResult.data;

    // Connect to database
    await connectToDatabase();

    // Increment page views for all categories using the repository function
    const updatedPageStats = await incrementPageViewsForCategories(slug, categories, date);

    if (!updatedPageStats || updatedPageStats.length === 0) {
      return NextResponse.json(
        { error: "Failed to track page view" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedPageStats,
      message: "Page views tracked successfully for all categories",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while tracking page view",
      },
      { status: 500 },
    );
  }
}
