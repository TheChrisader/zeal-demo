import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { createPreferences } from "@/database/preferences/preferences.repository";
import { ReferralCodeSchema } from "@/database/referral/referral.dto";
import { applyReferralCode } from "@/database/referral/referral.repository";
import { SignUpUserSchema } from "@/database/user/user.dto";
import { createUser, findUserByEmail } from "@/database/user/user.repository";
import { lucia } from "@/lib/auth/auth";
import { connectToDatabase, newId } from "@/lib/database";
import { getMMDB } from "@/lib/mmdb";
import { generateOTP } from "@/lib/otp";
import { sendAccountVerificationEmail } from "@/utils/email";
import { buildError, sendError } from "@/utils/error";
import {
  INTERNAL_ERROR,
  INVALID_INPUT_ERROR,
  USER_ALREADY_EXISTS_ERROR,
} from "@/utils/error/error-codes";
import { hashPassword } from "@/utils/password.utils";

// TODO: case sensitive usernames? Search user by both email and username to find if
// they exist

export const POST = async (request: NextRequest) => {
  try {
    await connectToDatabase();
    const body = await request.json();

    const SignUpSchema = SignUpUserSchema.merge(ReferralCodeSchema).setKey(
      "password",
      z.string().min(8, "At least 8 characters."),
    );
    const { email, username, password, display_name, referral_code } =
      SignUpSchema.parse(body);

    // get ip from request
    const header = headers();
    let ip_address = header.get("CF-Connecting-IP");

    let location: string;
    if (ip_address === "::1" || !ip_address) {
      ip_address = "127.0.0.1";
      location = "Nigeria";
    } else {
      const mmdb = await getMMDB();
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

    const APPROVED_COUNTRY_LIST = ["Nigeria", "Ghana", "South Africa", "Kenya"];
    let locationPreference = "Nigeria";

    if (APPROVED_COUNTRY_LIST.includes(createdUser.location)) {
      locationPreference = createdUser.location;
    }

    await createPreferences({
      user_id: createdUser.id,
      country: locationPreference,
    });

    // Apply referral code if provided
    if (referral_code) {
      try {
        await applyReferralCode(referral_code, createdUser.id);
      } catch (error) {
        console.error("Failed to apply referral code:", error);
        // Don't fail signup if referral code is invalid
      }
    }

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
