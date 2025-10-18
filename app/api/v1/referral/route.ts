import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { GenerateReferralCodeSchema } from "@/database/referral/referral.dto";
import { setUserReferralCode } from "@/database/referral/referral.repository";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import {
  INTERNAL_ERROR,
  INVALID_INPUT_ERROR,
  UNAUTHORIZED_ERROR,
} from "@/utils/error/error-codes";

/**
 * POST /api/v1/referral
 * Generate a referral code for the current user
 */
export const POST = async (request: NextRequest) => {
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

    const body = await request.json();
    const { userId } = GenerateReferralCodeSchema.parse(body);

    // Ensure user can only generate code for themselves
    if (userId !== user.id.toString()) {
      return sendError(
        buildError({
          code: UNAUTHORIZED_ERROR,
          message: "Can only generate referral code for yourself.",
          status: 401,
        }),
      );
    }

    // Check if user already has a referral code
    if (user.referral_code) {
      return NextResponse.json({
        referral_code: user.referral_code,
        message: "Referral code already exists",
      });
    }

    // Generate new referral code
    const updatedUser = await setUserReferralCode(userId);

    if (!updatedUser) {
      return sendError(
        buildError({
          code: INTERNAL_ERROR,
          message: "Failed to generate referral code.",
          status: 500,
        }),
      );
    }

    return NextResponse.json({
      referral_code: updatedUser.referral_code,
      message: "Referral code generated successfully",
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return sendError(
        buildError({
          code: INVALID_INPUT_ERROR,
          message: "Invalid input.",
          status: 422,
          data: error as ZodError,
        }),
      );
    }
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
