import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import UserModel from "@/database/user/user.model";
import { findUserWith2FAById } from "@/database/user/user.repository";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { validate2FA } from "@/lib/otp";
import { decryptSecret } from "@/utils/crypto.utils";
import { buildError, sendError } from "@/utils/error";
import {
  INVALID_INPUT_ERROR,
  UNAUTHORIZED_ERROR,
  WRONG_PASSWORD_ERROR,
} from "@/utils/error/error-codes";
import { verifyPassword } from "@/utils/password.utils";

const Disable2FASchema = z.object({
  password: z.string().min(1, "Password is required"),
  code: z.string().length(6, "2FA code must be 6 digits"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, code } = Disable2FASchema.parse(body);

    // Get authenticated user from session
    const { user } = await validateRequest();

    if (!user) {
      return sendError(
        buildError({
          code: UNAUTHORIZED_ERROR,
          message: "Unauthorized",
          status: 401,
        })
      );
    }

    await connectToDatabase();

    // Get user with password and 2FA fields
    const existingUser = await findUserWith2FAById(user.id);

    if (!existingUser?.two_fa_enabled) {
      return sendError(
        buildError({
          code: INVALID_INPUT_ERROR,
          message: "2FA is not enabled",
          status: 400,
        })
      );
    }

    // Verify password (if user has one)
    if (existingUser.has_password && existingUser.password_hash) {
      const isPasswordValid = await verifyPassword(
        password,
        existingUser.password_hash
      );
      if (!isPasswordValid) {
        return sendError(
          buildError({
            code: WRONG_PASSWORD_ERROR,
            message: "Invalid password",
            status: 401,
          })
        );
      }
    }

    // Verify 2FA code
    if (existingUser.two_fa_secret) {
      const { encrypted, iv, authTag } = JSON.parse(existingUser.two_fa_secret);
      const secret = decryptSecret(encrypted, iv, authTag);
      const isValid = validate2FA(secret, code);

      if (isValid === null) {
        return sendError(
          buildError({
            code: INVALID_INPUT_ERROR,
            message: "Invalid 2FA code",
            status: 400,
          })
        );
      }
    }

    // Disable 2FA by clearing all fields
    await UserModel.findByIdAndUpdate(user.id, {
      $set: {
        two_fa_enabled: false,
        two_fa_secret: null,
        two_fa_backup_codes: [],
        two_fa_backup_codes_used: [],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(
        buildError({
          code: INVALID_INPUT_ERROR,
          message: "Invalid input",
          status: 422,
          data: error,
        })
      );
    }
    console.error("Error disabling 2FA:", error);
    return NextResponse.json(
      { error: "Failed to disable 2FA" },
      { status: 500 }
    );
  }
}
