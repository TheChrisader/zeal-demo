import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { findUserByEmail } from "@/database/user/user.repository";
import { connectToDatabase } from "@/lib/database";
import { validateOTP } from "@/lib/otp";
import {
  INTERNAL_ERROR,
  INVALID_INPUT_ERROR,
  USER_NOT_FOUND_ERROR,
} from "@/utils/error/error-codes";

const ValidateOTPSchema = z.object({
  email: z.string().email("Invalid email address."),
  otp: z.string().min(6, "OTP must be at least 6 characters."),
});

export const POST = async (request: NextRequest) => {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Validate input
    const { email, otp } = ValidateOTPSchema.parse(body);

    // Find user by email
    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        {
          code: USER_NOT_FOUND_ERROR,
          message: "User with this email does not exist.",
          status: 404,
        },
        { status: 404 },
      );
    }

    // Validate OTP
    const isOTPValid = validateOTP(email, otp);

    if (isOTPValid === null) {
      return NextResponse.json(
        {
          code: INVALID_INPUT_ERROR,
          message: "Invalid or expired OTP.",
          status: 422,
        },
        { status: 422 },
      );
    }

    // Return success response
    return NextResponse.json(
      { message: "OTP validated successfully.", userId: user.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("OTP validation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          code: INVALID_INPUT_ERROR,
          message: "Invalid input.",
          errors: error.errors,
          status: 422,
        },
        { status: 422 },
      );
    }

    return NextResponse.json(
      {
        code: INTERNAL_ERROR,
        message: "Something went wrong. Please try again later.",
        status: 500,
      },
      { status: 500 },
    );
  }
};
