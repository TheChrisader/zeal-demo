import { NextResponse } from "next/server";
import { getInfluencerAnalytics } from "@/database/influencer/influencer.repository";
import { connectToDatabase } from "@/lib/database";

/**
 * GET /api/v1/admin/influencer/analytics
 * Get influencer analytics summary
 */
export async function GET() {
  try {
    await connectToDatabase();

    const analytics = await getInfluencerAnalytics();

    return NextResponse.json(
      { data: analytics },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Admin influencer analytics API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
