import { NextRequest, NextResponse } from "next/server";
import { UpdateInfluencerSchema } from "@/database/influencer/influencer.dto";
import {
  deleteInfluencer,
  getInfluencerById,
  updateInfluencer,
} from "@/database/influencer/influencer.repository";
import { connectToDatabase } from "@/lib/database";
import { verifyToken } from "@/lib/jwt";

/**
 * GET /api/v1/admin/influencer/:influencerId
 * Get a single influencer by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ influencerId: string }> }
) {
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

    const { influencerId } = await params;

    const influencer = await getInfluencerById(influencerId);

    if (!influencer) {
      return NextResponse.json(
        { error: "Influencer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { data: influencer },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Admin influencer get API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/admin/influencer/:influencerId
 * Update an influencer
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ influencerId: string }> }
) {
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

    const { influencerId } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = UpdateInfluencerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const updates = validationResult.data;

    const influencer = await updateInfluencer(influencerId, updates);

    if (!influencer) {
      return NextResponse.json(
        { error: "Influencer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { data: influencer },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Admin influencer update API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/admin/influencer/:influencerId
 * Delete an influencer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ influencerId: string }> }
) {
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

    const { influencerId } = await params;

    const influencer = await deleteInfluencer(influencerId);

    if (!influencer) {
      return NextResponse.json(
        { error: "Influencer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { data: influencer },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Admin influencer delete API Error:", error);
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
      "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
