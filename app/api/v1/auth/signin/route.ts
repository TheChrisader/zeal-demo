import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { LoginUserSchema } from "@/database/user/user.dto";
import { findUserWithPasswordByUsername } from "@/database/user/user.repository";
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
    const existingUser = await findUserWithPasswordByUsername(username);

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

    const { password_hash: _, ...user } = existingUser;

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
