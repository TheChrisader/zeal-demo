import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/database/user/user.model";
import { findUserWith2FAById } from "@/database/user/user.repository";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { generateBackupCodes, validate2FA } from "@/lib/otp";
import { decryptSecret } from "@/utils/crypto.utils";
import { buildError, sendError } from "@/utils/error";
import { INVALID_INPUT_ERROR, UNAUTHORIZED_ERROR } from "@/utils/error/error-codes";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

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

    // Get user with 2FA fields
    const existingUser = await findUserWith2FAById(user.id);

    if (!existingUser?.two_fa_secret) {
      return sendError(
        buildError({
          code: INVALID_INPUT_ERROR,
          message: "2FA setup not initiated. Please generate a QR code first.",
          status: 400,
        })
      );
    }

    // Decrypt the secret
    const { encrypted, iv, authTag } = JSON.parse(existingUser.two_fa_secret);
    const secret = decryptSecret(encrypted, iv, authTag);

    // Validate the code
    const isValid = validate2FA(secret, code);

    if (isValid === null) {
      return sendError(
        buildError({
          code: INVALID_INPUT_ERROR,
          message: "Invalid verification code",
          status: 400,
        })
      );
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) => hash(code, 12))
    );

    // Enable 2FA and store backup codes
    await UserModel.findByIdAndUpdate(user.id, {
      $set: {
        two_fa_enabled: true,
        two_fa_backup_codes: hashedBackupCodes,
      },
    });

    // Return backup codes (only shown once)
    return NextResponse.json({
      success: true,
      backupCodes,
    });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA code" },
      { status: 500 }
    );
  }
}
