import { NextRequest, NextResponse } from "next/server";
import { ReferralLeaderboardQuerySchema } from "@/database/referral/referral.dto";
import { getReferralLeaderboard } from "@/database/referral/referral.repository";
import { connectToDatabase } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const weekOffset = parseInt(searchParams.get("weekOffset") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");

    const validationResult = ReferralLeaderboardQuerySchema.safeParse({
      weekOffset,
      limit,
    });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 },
      );
    }

    const { weekOffset: validatedWeekOffset, limit: validatedLimit } =
      validationResult.data;

    // Get referral leaderboard data
    const leaderboard = await getReferralLeaderboard(
      validatedWeekOffset,
      validatedLimit,
    );

    return NextResponse.json(leaderboard, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Admin referral leaderboard API Error:", error);
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
