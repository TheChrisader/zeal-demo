import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { applyReferralCode } from "@/database/referral/referral.repository";
import { ReferralCodeSchema } from "@/database/referral/referral.dto";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import {
  INTERNAL_ERROR,
  INVALID_INPUT_ERROR,
  UNAUTHORIZED_ERROR,
} from "@/utils/error/error-codes";

const ApplyReferralSchema = z.object({
  referral_code: ReferralCodeSchema.shape.referral_code,
});

export const POST = async (request: NextRequest) => {
  try {
    await connectToDatabase();

    // Get current user
    const { user } = await validateRequest();
    if (!user) {
      return sendError(
        buildError({
          code: UNAUTHORIZED_ERROR,
          message: "User not authenticated.",
          status: 401,
        }),
      );
    }

    const body = await request.json();
    const { referral_code } = ApplyReferralSchema.parse(body);

    // Apply referral code
    const success = await applyReferralCode(referral_code as string, user.id);

    if (!success) {
      return sendError(
        buildError({
          code: INVALID_INPUT_ERROR,
          message: "Invalid or expired referral code.",
          status: 400,
        }),
      );
    }

    return NextResponse.json(
      {
        message: "Referral code applied successfully",
        referral_code,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return sendError(
        buildError({
          code: INVALID_INPUT_ERROR,
          message: "Invalid referral code format.",
          status: 422,
          data: error as ZodError,
        }),
      );
    }

    return sendError(
      buildError({
        code: INTERNAL_ERROR,
        message:
          error instanceof Error
            ? error.message
            : "Failed to apply referral code.",
        status: 500,
        data: error,
      }),
    );
  }
};
