import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import UserModel from "@/database/user/user.model";
import { findUserWith2FAById } from "@/database/user/user.repository";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { generateBackupCodes } from "@/lib/otp";
import { buildError, sendError } from "@/utils/error";
import {
  INVALID_INPUT_ERROR,
  UNAUTHORIZED_ERROR,
  WRONG_PASSWORD_ERROR,
} from "@/utils/error/error-codes";
import { verifyPassword } from "@/utils/password.utils";

const RegenerateBackupCodesSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = RegenerateBackupCodesSchema.parse(body);

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

    // Verify password
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

    // Generate new backup codes
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) => hash(code, 12))
    );

    // Store new backup codes and clear used list
    await UserModel.findByIdAndUpdate(user.id, {
      $set: {
        two_fa_backup_codes: hashedBackupCodes,
        two_fa_backup_codes_used: [],
      },
    });

    // Return backup codes (only shown once)
    return NextResponse.json({ backupCodes });
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
    console.error("Error regenerating backup codes:", error);
    return NextResponse.json(
      { error: "Failed to regenerate backup codes" },
      { status: 500 }
    );
  }
}
