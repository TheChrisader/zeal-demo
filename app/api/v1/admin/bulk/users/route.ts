import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/database/user/user.model";
import { connectToDatabase } from "@/lib/database";

// Types for query parameters
interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  country?: string;
  fromDate?: string;
  toDate?: string;
  role?: string;
  has_email_verified?: boolean;
  auth_provider?: string;
  last_login_at?: Date;
}

interface QueryObject {
  $or?: [
    { username: { $regex: string; $options: "i" } },
    { display_name: { $regex: string; $options: "i" } },
    { email: { $regex: string; $options: "i" } },
  ];
  role?: string;
  location?: string;
  created_at?: { $gte?: Date; $lte?: Date };
  has_email_verified?: boolean;
  auth_provider?: string;
  last_login_at?: { $gte?: Date; $lte?: Date };
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
      sort: searchParams.get("sort") || "created_at",
      order: (searchParams.get("order") as "asc" | "desc") || "desc",
      search: searchParams.get("search") || undefined,
      country: searchParams.get("country") || undefined,
      fromDate: searchParams.get("fromDate") || undefined,
      toDate: searchParams.get("toDate") || undefined,
      role: searchParams.get("role") || undefined,
      has_email_verified: searchParams.get("has_email_verified")
        ? searchParams.get("has_email_verified") === "true"
        : undefined,
      auth_provider: searchParams.get("auth_provider") || undefined,
      last_login_at: searchParams.get("last_login_at")
        ? new Date(searchParams.get("last_login_at")!)
        : undefined,
    };

    // Build query
    const query: QueryObject = {};

    if (params.search) {
      query.$or = [
        { username: { $regex: params.search, $options: "i" } },
        { display_name: { $regex: params.search, $options: "i" } },
        { email: { $regex: params.search, $options: "i" } },
      ];
    }

    if (params.fromDate || params.toDate) {
      query.created_at = {};
      if (params.fromDate) {
        query.created_at.$gte = new Date(params.fromDate);
      }
      if (params.toDate) {
        query.created_at.$lte = new Date(params.toDate);
      }
    }

    if (params.role) {
      query.role = params.role;
    }

    if (params.country) {
      query.location = params.country;
    }

    if (params.has_email_verified) {
      query.has_email_verified = params.has_email_verified;
    }

    if (params.auth_provider) {
      query.auth_provider = params.auth_provider;
    }

    if (params.last_login_at) {
      query.last_login_at = {};
      if (params.last_login_at) {
        query.last_login_at.$gte = new Date(params.last_login_at);
      }
    }

    // Calculate skip value for pagination
    const skip = (params.page! - 1) * params.limit!;

    // Get total count for pagination
    const total = await UserModel.countDocuments(query);

    // Execute query with pagination and sorting
    const users = await UserModel.find(query)
      .select("-password_hash")
      .sort({ [params.sort!]: params.order! })
      .skip(skip)
      .limit(params.limit!)
      .lean();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / params.limit!);
    const hasMore = params.page! < totalPages;

    // Return response
    return NextResponse.json(
      {
        status: "success",
        data: {
          users,
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
    console.error("Users API Error:", error);
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

export async function DELETE(req: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Get ids from request body
    const { ids } = await req.json();

    const deletedUsers = await UserModel.deleteMany({ _id: { $in: ids } });

    return NextResponse.json(
      {
        status: "success",
        data: deletedUsers,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Users API Error:", error);
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
