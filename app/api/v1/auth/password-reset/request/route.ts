import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { findUserByEmail } from "@/database/user/user.repository";
import { connectToDatabase } from "@/lib/database";
import { generateOTP } from "@/lib/otp";

import {
  INTERNAL_ERROR,
  INVALID_INPUT_ERROR,
  USER_NOT_FOUND_ERROR,
} from "@/utils/error/error-codes";
import { sendResetPasswordEmail } from "@/utils/email";

const RequestPasswordResetSchema = z.object({
  email: z.string().email("Invalid email address."),
});

export const POST = async (request: NextRequest) => {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Validate input
    const { email } = RequestPasswordResetSchema.parse(body);

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

    // Generate OTP
    const otp = await generateOTP(user.email);

    // Send password reset email with OTP
    await sendResetPasswordEmail(user, otp);

    // Return success response without exposing sensitive information
    return NextResponse.json(
      { message: "Password reset instructions sent to your email." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Password reset request error:", error);

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
