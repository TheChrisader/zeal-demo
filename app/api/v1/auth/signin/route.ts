import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { LoginUserSchema } from "@/database/user/user.dto";
import { findUserWith2FAByUsername } from "@/database/user/user.repository";
import { lucia } from "@/lib/auth/auth";
import { connectToDatabase, newId } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import {
  INTERNAL_ERROR,
  INVALID_INPUT_ERROR,
  USER_NOT_FOUND_ERROR,
} from "@/utils/error/error-codes";
import { verifyPassword } from "@/utils/password.utils";

export const POST = async (request: NextRequest) => {
  try {
    await connectToDatabase();
    const body = await request.json();

    const LoginSchema = LoginUserSchema.setKey(
      "password",
      z.string().min(8, "At least 8 characters."),
    );
    const { username, password } = LoginSchema.parse(body);
    const existingUser = await findUserWith2FAByUsername(username);

    if (!existingUser || !existingUser.has_password) {
      return sendError(
        buildError({
          code: USER_NOT_FOUND_ERROR,
          message: "Invalid username or password.",
          status: 422,
        }),
      );
    }

    const isPasswordValid = await verifyPassword(
      password,
      existingUser.password_hash,
    );

    if (!isPasswordValid) {
      return sendError(
        buildError({
          code: INVALID_INPUT_ERROR,
          message: "Invalid username or password.",
          status: 422,
        }),
      );
    }

    const { password_hash: _, two_fa_secret: __, two_fa_backup_codes: ___, two_fa_backup_codes_used: ____, ...user } = existingUser;

    // Check if user has 2FA enabled
    if (existingUser.two_fa_enabled) {
      // Create partial session with 2FA pending flag
      const session = await lucia.createSession(newId(existingUser.id), {
        two_fa_pending: true,
      });
      const sessionCookie = lucia.createSessionCookie(session.id);

      return NextResponse.json(
        {
          requires2FA: true,
          message: "2FA verification required",
        },
        {
          status: 200,
          headers: {
            "Set-Cookie": sessionCookie.serialize(),
          },
        }
      );
    }

    // Original session creation code continues for non-2FA users
    const session = await lucia.createSession(newId(existingUser.id), {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    return NextResponse.json(user, {
      status: 201,
      headers: {
        // Location: "/",
        "Set-Cookie": sessionCookie.serialize(),
      },
    });
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
