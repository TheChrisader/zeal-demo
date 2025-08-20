import { NextRequest, NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import { connectToDatabase } from "@/lib/database";

interface QueryParams {
  page: number;
  limit: number;
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
    };

    // Calculate skip value for pagination
    const skip = (params.page - 1) * params.limit;

    // Get start and end of current day
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Build query for posts created today with source_type "auto"
    const query = {
      created_at: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      source_type: "auto",
    };

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
