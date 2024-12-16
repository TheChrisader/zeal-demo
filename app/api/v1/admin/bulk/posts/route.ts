import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import { connectToDatabase, Id, newId } from "@/lib/database";

// Types for query parameters
interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  category?: string;
  language?: string;
  country?: string;
  fromDate?: string;
  toDate?: string;
  author?: string;
  published?: boolean;
}

interface QueryObject {
  $or?: [
    { title: { $regex: string; $options: "i" } },
    { description: { $regex: string; $options: "i" } },
  ];
  category?: { $in: string };
  language?: string;
  country?: { $in: string };
  published_at?: { $gte?: Date; $lte?: Date };
  author_id?: Id;
  published?: boolean;
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
      sort: searchParams.get("sort") || "published_at",
      order: (searchParams.get("order") as "asc" | "desc") || "desc",
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      language: searchParams.get("language") || undefined,
      country: searchParams.get("country") || undefined,
      fromDate: searchParams.get("fromDate") || undefined,
      toDate: searchParams.get("toDate") || undefined,
      author: searchParams.get("author") || undefined,
      published: searchParams.get("published")
        ? searchParams.get("published") === "true"
        : undefined,
    };

    // Build query
    const query: QueryObject = {};

    // Search in title and content
    if (params.search) {
      query.$or = [
        { title: { $regex: params.search, $options: "i" } },
        { description: { $regex: params.search, $options: "i" } },
      ];
    }

    // Category filter
    if (params.category && params.category.length > 0) {
      query.category = { $in: params.category };
    }

    // Language filter
    if (params.language) {
      query.language = params.language;
    }

    // Country filter
    if (params.country && params.country.length > 0) {
      query.country = { $in: params.country };
    }

    // Date range filter
    if (params.fromDate || params.toDate) {
      query.published_at = {};
      if (params.fromDate) {
        query.published_at.$gte = params.fromDate
          ? new Date(params.fromDate)
          : undefined;
      }
      if (params.toDate) {
        query.published_at.$lte = params.toDate
          ? new Date(params.toDate)
          : undefined;
      }
    }

    // Author filter
    if (params.author) {
      query.author_id = newId(params.author);
    }

    // Published filter
    if (typeof params.published !== "undefined") {
      query.published = params.published;
    }

    // Calculate skip value for pagination
    const skip = (params.page! - 1) * params.limit!;

    // Get total count for pagination
    const total = await PostModel.countDocuments(query);

    console.dir(query, { depth: null });

    // Execute query with pagination and sorting
    const posts = await PostModel.find(query)
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
    console.error("Posts API Error:", error);
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

    // grabs the posts form the db, selecting only their categories and putting them in a Set
    const fetchedCategories = await PostModel.find({
      _id: { $in: ids },
    }).select<{ category: string[] }>(" category ");

    const categories = new Set<string>();
    fetchedCategories.forEach((cat) =>
      cat.category.forEach((c) => categories.add(c)),
    );

    // Delete posts`
    const deletedPosts = await PostModel.deleteMany({ _id: { $in: ids } });

    // revalidateTag(``)
    categories.forEach((c) => revalidateTag(c));

    // Return response
    return NextResponse.json(
      {
        status: "success",
        data: deletedPosts,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Posts API Error:", error);
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
