import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { createPreferences } from "@/database/preferences/preferences.repository";
import { SignUpUserSchema } from "@/database/user/user.dto";
import { createUser, findUserByEmail } from "@/database/user/user.repository";
import { lucia } from "@/lib/auth/auth";
import { connectToDatabase, newId } from "@/lib/database";
import { generateOTP } from "@/lib/otp";
import { sendAccountVerificationEmail } from "@/utils/email";
import { buildError, sendError } from "@/utils/error";
import { promises as fs } from "fs";
import * as MMDB from "mmdb-lib";
import {
  INTERNAL_ERROR,
  INVALID_INPUT_ERROR,
  USER_ALREADY_EXISTS_ERROR,
} from "@/utils/error/error-codes";
import { hashPassword } from "@/utils/password.utils";
import { headers } from "next/headers";

// TODO: case sensitive usernames? Search user by both email and username to find if
// they exist

export const POST = async (request: NextRequest) => {
  try {
    await connectToDatabase();
    const body = await request.json();

    const SignUpSchema = SignUpUserSchema.setKey(
      "password",
      z.string().min(8, "At least 8 characters."),
    );
    const { email, username, password, display_name } =
      SignUpSchema.parse(body);

    // get ip from request
    const header = headers();
    let ip_address = header.get("x-forwarded-for");

    let location: string;
    if (ip_address === "::1" || !ip_address) {
      ip_address = "127.0.0.1";
      location = "Nigeria";
    } else {
      const mmdbLocation = await fs.readFile("/mmdb/GeoLite2-Country.mmdb");

      const mmdb = new MMDB.Reader<MMDB.CountryResponse>(mmdbLocation);
      const result = mmdb.get(ip_address);

      if (!result?.country?.names["en"]) {
        location = "Nigeria";
      } else {
        location = result?.country?.names["en"];
      }
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return sendError(
        buildError({
          code: USER_ALREADY_EXISTS_ERROR,
          message: "User already exists.",
          status: 422,
        }),
      );
    }

    const hashedPassword = await hashPassword(password);

    const createdUser = await createUser({
      email: email.toLowerCase().trim(),
      username: username.toLowerCase().trim(),
      display_name,
      password: hashedPassword,
      location,
      ip_address,
      auth_provider: "email",
      role: "user",
      has_password: true,
    });

    if (!createdUser) {
      return sendError(
        buildError({
          code: INTERNAL_ERROR,
          message: "User not created.",
          status: 500,
        }),
      );
    }

    await createPreferences({ user_id: createdUser.id });

    const session = await lucia.createSession(newId(createdUser.id), {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    const totp = await generateOTP(createdUser.email);

    await sendAccountVerificationEmail(createdUser, totp);

    return NextResponse.json(createdUser, {
      status: 201,
      headers: { "Set-Cookie": sessionCookie.serialize() },
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
