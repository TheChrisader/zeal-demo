import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  findUserByEmail,
  updateUserPassword,
} from "@/database/user/user.repository";
import { connectToDatabase } from "@/lib/database";
import {
  INTERNAL_ERROR,
  INVALID_INPUT_ERROR,
  USER_NOT_FOUND_ERROR,
} from "@/utils/error/error-codes";
import { hashPassword } from "@/utils/password.utils";
import { validateRequest } from "@/lib/auth/auth";

const ResetPasswordSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const POST = async (request: NextRequest) => {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { user: currentUser } = await validateRequest();

    if (!currentUser) {
      return NextResponse.json(
        {
          code: USER_NOT_FOUND_ERROR,
          message: "User with this email does not exist.",
          status: 404,
        },
        { status: 404 },
      );
    }
    const userId = currentUser.id.toString();

    // Validate input
    const { email, password } = ResetPasswordSchema.parse(body);

    // Find user by email to double-check
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

    // Verify that the provided userId matches the found user
    if (user.id.toString() !== userId) {
      return NextResponse.json(
        {
          code: INVALID_INPUT_ERROR,
          message: "Invalid user information.",
          status: 422,
        },
        { status: 422 },
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user's password using the dedicated function
    try {
      await updateUserPassword(user.id, hashedPassword, user.id);
    } catch (error) {
      return NextResponse.json(
        {
          code: INTERNAL_ERROR,
          message: "Failed to update password.",
          status: 500,
        },
        { status: 500 },
      );
    }

    // Return success response
    return NextResponse.json(
      { message: "Password has been reset successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Password reset verification error:", error);

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
