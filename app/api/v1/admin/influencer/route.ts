import { NextRequest, NextResponse } from "next/server";
import {
  CreateInfluencerSchema,
  ListInfluencersQuerySchema,
} from "@/database/influencer/influencer.dto";
import {
  countInfluencers,
  createInfluencer,
  listInfluencers,
} from "@/database/influencer/influencer.repository";
import { connectToDatabase } from "@/lib/database";
import { verifyToken } from "@/lib/jwt";

/**
 * GET /api/v1/admin/influencer
 * List all influencers with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    const validationResult = ListInfluencersQuerySchema.safeParse({
      status,
      limit,
      skip,
    });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { status: validatedStatus, limit: validatedLimit, skip: validatedSkip } =
      validationResult.data;

    // Get influencers and total count in parallel
    const [influencers, total] = await Promise.all([
      listInfluencers({
        status: validatedStatus,
        limit: validatedLimit,
        skip: validatedSkip,
      }),
      countInfluencers({ status: validatedStatus }),
    ]);

    return NextResponse.json(
      {
        data: influencers,
        meta: {
          total,
          limit: validatedLimit,
          skip: validatedSkip,
          has_more: validatedSkip + validatedLimit < total,
        },
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Admin influencer list API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/influencer
 * Create a new influencer
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validationResult = CreateInfluencerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { user_id, status, notes } = validationResult.data;

    // Create influencer
    const influencer = await createInfluencer(user_id, status, notes);

    if (!influencer) {
      return NextResponse.json(
        { error: "Failed to create influencer" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: influencer },
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Admin influencer create API Error:", error);

    // Handle specific error messages
    if (error instanceof Error) {
      if (error.message === "User not found") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (error.message === "User is already an influencer") {
        return NextResponse.json(
          { error: "User is already an influencer" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
