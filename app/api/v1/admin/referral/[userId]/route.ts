import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { getAdminReferralUserAnalytics } from "@/database/referral/referral.repository";
import { AdminReferralUserParamsSchema } from "@/database/referral/referral.dto";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    await connectToDatabase();

    // Validate userId parameter
    const validationResult = AdminReferralUserParamsSchema.safeParse({
      userId: params.userId,
    });
    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const { userId } = validationResult.data;

    // Get user referral analytics
    const analytics = await getAdminReferralUserAnalytics(userId);

    if (!analytics) {
      return NextResponse.json(
        { error: "User not found or user is not a referrer" },
        { status: 404 },
      );
    }

    return NextResponse.json(analytics, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Admin referral user analytics API Error:", error);
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
