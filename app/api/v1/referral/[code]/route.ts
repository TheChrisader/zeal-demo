import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { ValidateReferralCodeSchema } from "@/database/referral/referral.dto";
import { findUserByReferralCode } from "@/database/referral/referral.repository";
import { connectToDatabase } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import { INTERNAL_ERROR, INVALID_INPUT_ERROR } from "@/utils/error/error-codes";

/**
 * GET /api/v1/referral/[code]
 * Validate a referral code and return referrer info
 */
export const GET = async (
  request: NextRequest,
  { params }: { params: { code: string } },
) => {
  try {
    await connectToDatabase();

    const { code } = ValidateReferralCodeSchema.parse({ code: params.code });

    const referrer = await findUserByReferralCode(code);

    if (!referrer) {
      return sendError(
        buildError({
          code: "404",
          message: "Invalid referral code.",
          status: 404,
        }),
      );
    }

    // Return limited referrer information (don't expose sensitive data)
    return NextResponse.json({
      valid: true,
      referrer: {
        display_name: referrer.display_name,
        username: referrer.username,
        avatar: referrer.avatar,
      },
    });
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
        message: error instanceof Error ? error.message : "An error occurred.",
        status: 500,
        data: error,
      }),
    );
  }
};
