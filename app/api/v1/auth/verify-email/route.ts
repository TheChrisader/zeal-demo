import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { findUserByEmail, updateUser } from "@/database/user/user.repository";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { validateEmailOTP } from "@/lib/otp";
import { buildError, sendError } from "@/utils/error";
import {
  INTERNAL_ERROR,
  INVALID_INPUT_ERROR,
  USER_ALREADY_EXISTS_ERROR,
} from "@/utils/error/error-codes";

export const POST = async (request: NextRequest) => {
  try {
    await connectToDatabase();

    const { user } = await serverAuthGuard();

    if (!user) {
      return sendError(
        buildError({
          code: USER_ALREADY_EXISTS_ERROR,
          message: "No user",
          status: 422,
        }),
      );
    }

    const body = await request.json();

    const { otp } = body;

    if (!otp) {
      return sendError(
        buildError({
          code: USER_ALREADY_EXISTS_ERROR,
          message: "No OTP in body.",
          status: 422,
        }),
      );
    }

    const isTokenValid = validateEmailOTP(user.email as string, otp);

    if (isTokenValid === null) {
      return sendError(
        buildError({
          code: USER_ALREADY_EXISTS_ERROR,
          message: "Token not valid",
          status: 422,
        }),
      );
    }

    const userData = await findUserByEmail(user.email as string);

    if (!userData) {
      return sendError(
        buildError({
          code: USER_ALREADY_EXISTS_ERROR,
          message: "No user found",
          status: 422,
        }),
      );
    }

    const updatedUser = await updateUser(
      {
        id: userData.id,
        has_email_verified: true,
      },
      { newDocument: true },
    );

    if (!updatedUser) {
      throw new Error("Something went wrong.");
    }

    return NextResponse.json(updatedUser);
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
        message: error instanceof Error ? error.message : "An error occured.",
        status: 500,
        data: error,
      }),
    );
  }
};
