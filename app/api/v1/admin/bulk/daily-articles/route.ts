import { NextRequest, NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import { connectToDatabase } from "@/lib/database";

interface QueryParams {
  page: number;
  limit: number;
  processed: number;
}

export async function GET(req: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Get URL parameters
    const searchParams = req.nextUrl.searchParams;
    const params: QueryParams = {
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
      processed: Number(searchParams.get("processed")) || 0,
    };

    // Calculate skip value for pagination
    const skip = (params.page - 1) * params.limit;

    // Get start and end of current day
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0) - 60 * 60 * 1000);
    const endOfDay = new Date(today.setHours(23, 59, 59, 999) - 60 * 60 * 1000);

    // Build query for posts created today with source_type "auto"
    const query: any = {
      created_at: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      source_type: "auto",
    };

    // Add has_been_processed condition
    if (params.processed === 1) {
      // If processed=1, only return posts where has_been_processed is true
      query.has_been_processed = true;
    } else {
      // If processed=0 (default), return posts where has_been_processed is false OR doesn't exist
      query.$or = [
        { has_been_processed: false },
        { has_been_processed: { $exists: false } }
      ];
    }

    // Get total count for pagination
    const total = await PostModel.countDocuments(query);

    // Execute query with pagination
    const posts = await PostModel.find(query, "_id title slug")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(params.limit)
      .lean();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / params.limit);
    const hasMore = params.page < totalPages;

    // Return response
    return NextResponse.json(
      {
        status: "success",
        data: {
          posts,
          pagination: {
            page: params.page,
            limit: params.limit,
            total,
            totalPages,
            hasMore,
          },
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Daily Articles API Error:", error);
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
