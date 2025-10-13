import { NextRequest, NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import { connectToDatabase } from "@/lib/database";

export async function GET(req: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Get start and end of current day
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0) - 60 * 60 * 1000);
    const endOfDay = new Date(today.setHours(23, 59, 59, 999) - 60 * 60 * 1000);

    // Build query for all posts created today with source_type "auto"
    // No processed filtering - get everything
    const query = {
      created_at: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      source_type: "auto",
    };

    // Execute query without pagination, get all documents
    const posts = await PostModel.find(query, "title slug")
      .sort({ created_at: -1 })
      .lean();

    // Return response
    return NextResponse.json(
      {
        status: "success",
        data: {
          posts,
          total: posts.length,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Daily Articles Dump API Error:", error);
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