import { NextRequest, NextResponse } from "next/server";
import { getReferralStats } from "@/database/referral/referral.repository";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import { INTERNAL_ERROR, UNAUTHORIZED_ERROR } from "@/utils/error/error-codes";

/**
 * GET /api/v1/referral/analytics
 * Get referral analytics for the current user
 */
export const GET = async (request: NextRequest) => {
  try {
    await connectToDatabase();

    const { user } = await validateRequest();
    if (!user) {
      return sendError(
        buildError({
          code: UNAUTHORIZED_ERROR,
          message: "Unauthorized.",
          status: 401,
        }),
      );
    }

    const referredUsers = await getReferralStats(user.id);

    const analytics = {
      total_referrals: user.referral_count || 0,
      referral_code: user.referral_code,
      referral_link: user.referral_code
        ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/en?ref=${user.referral_code}`
        : null,
      recent_referrals: referredUsers,
    };

    return NextResponse.json(analytics);
  } catch (error: unknown) {
    return sendError(
      buildError({
        code: INTERNAL_ERROR,
        message: error instanceof Error ? error.message : "An error occurred.",
        status: 500,
        data: error,
      }),
    );
  }
};
