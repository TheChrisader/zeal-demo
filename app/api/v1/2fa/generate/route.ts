import { NextResponse } from "next/server";
import UserModel from "@/database/user/user.model";
import { findUserWith2FAById } from "@/database/user/user.repository";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { generateOTPURL, generateSecret } from "@/lib/otp";
import { encryptSecret } from "@/utils/crypto.utils";
import { buildError, sendError } from "@/utils/error";
import {
  INVALID_INPUT_ERROR,
  UNAUTHORIZED_ERROR,
} from "@/utils/error/error-codes";

export async function POST() {
  try {
    // Get authenticated user from session
    const { user } = await validateRequest();

    if (!user) {
      return sendError(
        buildError({
          code: UNAUTHORIZED_ERROR,
          message: "Unauthorized",
          status: 401,
        }),
      );
    }

    await connectToDatabase();

    // Check if 2FA is already enabled
    const existingUser = await findUserWith2FAById(user.id);
    if (existingUser?.two_fa_enabled) {
      return sendError(
        buildError({
          code: INVALID_INPUT_ERROR,
          message: "2FA is already enabled",
          status: 400,
        }),
      );
    }

    // Generate unique secret for this user
    const secret = generateSecret();
    if (!user.email) {
      return sendError(
        buildError({
          code: INVALID_INPUT_ERROR,
          message: "User email is required",
          status: 400,
        }),
      );
    }
    const qrCodeUrl = generateOTPURL(user.email, secret);

    // Encrypt and store the secret (but don't enable 2FA yet)
    const { encrypted, iv, authTag } = encryptSecret(secret);

    // Update user with encrypted secret (2FA not enabled until verification)
    await UserModel.findByIdAndUpdate(user.id, {
      $set: {
        two_fa_secret: JSON.stringify({ encrypted, iv, authTag }),
      },
    });

    return NextResponse.json({ qrCode: qrCodeUrl });
  } catch (error) {
    console.error("Error generating 2FA:", error);
    return NextResponse.json(
      { error: "Failed to generate 2FA QR code" },
      { status: 500 },
    );
  }
}
