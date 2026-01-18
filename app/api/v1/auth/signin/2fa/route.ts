import { compare } from "bcryptjs";
import type { Session } from "lucia";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import UserModel from "@/database/user/user.model";
import { findUserWith2FAById } from "@/database/user/user.repository";
import { lucia, validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { newId } from "@/lib/database";
import { validate2FA } from "@/lib/otp";
import { decryptSecret } from "@/utils/crypto.utils";
import { buildError, sendError } from "@/utils/error";
import {
  INVALID_INPUT_ERROR,
  UNAUTHORIZED_ERROR,
} from "@/utils/error/error-codes";

const Verify2FASchema = z
  .object({
    code: z.string().length(6).optional(),
    backupCode: z.string().optional(),
  })
  .refine((data) => data.code || data.backupCode, {
    message: "Either code or backupCode is required",
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, backupCode } = Verify2FASchema.parse(body);

    // Get user and session from cookie
    const { user, session } = await validateRequest();

    if (!user || !session) {
      return sendError(
        buildError({
          code: UNAUTHORIZED_ERROR,
          message: "Unauthorized",
          status: 401,
        }),
      );
    }

    // Check if this is a pending 2FA session
    if (!(session as Session & { two_fa_pending?: boolean }).two_fa_pending) {
      return sendError(
        buildError({
          code: INVALID_INPUT_ERROR,
          message: "Session already verified or invalid",
          status: 400,
        }),
      );
    }

    await connectToDatabase();

    // Get user with 2FA fields
    const existingUser = await findUserWith2FAById(user.id);

    if (!existingUser?.two_fa_enabled) {
      return sendError(
        buildError({
          code: INVALID_INPUT_ERROR,
          message: "2FA is not enabled for this account",
          status: 400,
        }),
      );
    }

    let isValid = false;
    let usedBackupCode = false;

    // Check TOTP code
    if (code && existingUser.two_fa_secret) {
      const { encrypted, iv, authTag } = JSON.parse(existingUser.two_fa_secret);
      const secret = decryptSecret(encrypted, iv, authTag);
      const validationResult = validate2FA(secret, code);
      isValid = validationResult !== null;
    }

    // Check backup code
    if (!isValid && backupCode && existingUser.two_fa_backup_codes) {
      // Compare the plaintext backup code against each stored hash
      let matchedIndex = -1;
      let matchedHash: string | null = null;

      for (let i = 0; i < existingUser.two_fa_backup_codes.length; i++) {
        const storedHash = existingUser.two_fa_backup_codes[i];
        if (!storedHash) continue; // Skip undefined values

        const isAlreadyUsed =
          existingUser.two_fa_backup_codes_used?.includes(storedHash);

        if (!isAlreadyUsed) {
          // Use bcrypt.compare to check if the provided code matches the stored hash
          const isMatch = await compare(backupCode, storedHash);
          if (isMatch) {
            matchedIndex = i;
            matchedHash = storedHash;
            break;
          }
        }
      }

      if (matchedIndex !== -1 && matchedHash) {
        isValid = true;
        usedBackupCode = true;

        // Mark backup code as used
        await UserModel.findByIdAndUpdate(user.id, {
          $set: {
            two_fa_backup_codes_used: [
              ...(existingUser.two_fa_backup_codes_used || []),
              matchedHash,
            ],
          },
        });
      }
    }

    if (!isValid) {
      return sendError(
        buildError({
          code: INVALID_INPUT_ERROR,
          message: "Invalid verification code",
          status: 400,
        }),
      );
    }

    // Invalidate partial session and create full session
    await lucia.invalidateSession(session.id);
    const newSession = await lucia.createSession(newId(user.id), {});
    const sessionCookie = lucia.createSessionCookie(newSession.id);

    return NextResponse.json(
      {
        success: true,
        usedBackupCode,
        message: usedBackupCode
          ? "Backup code used. Consider regenerating codes from settings."
          : "Login successful",
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": sessionCookie.serialize(),
        },
      },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(
        buildError({
          code: INVALID_INPUT_ERROR,
          message: "Invalid input",
          status: 422,
          data: error,
        }),
      );
    }
    console.error("Error verifying 2FA login:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA code" },
      { status: 500 },
    );
  }
}
