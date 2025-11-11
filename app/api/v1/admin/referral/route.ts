import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { getAdminReferralSummary } from "@/database/referral/referral.repository";
import { AdminReferralSummaryQuerySchema } from "@/database/referral/referral.dto";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30d";

    const validationResult = AdminReferralSummaryQuerySchema.safeParse({ timeRange });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid time range. Allowed values: 7d, 30d, 90d" },
        { status: 400 }
      );
    }

    const { timeRange: validatedTimeRange } = validationResult.data;

    // Get referral summary data
    const summary = await getAdminReferralSummary(validatedTimeRange);

    return NextResponse.json(summary, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Admin referral summary API Error:", error);
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}