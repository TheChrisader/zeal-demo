import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { ReferralCodeSchema } from "@/database/referral/referral.dto";
import { applyReferralCode } from "@/database/referral/referral.repository";
import SubscriberModel from "@/database/subscriber/subscriber.model";
import UserModel from "@/database/user/user.model";
import { lucia } from "@/lib/auth/auth";
import { connectToDatabase, newId } from "@/lib/database";
import { getMMDB } from "@/lib/mmdb";
import { generateEmailOTP } from "@/lib/otp";
import { generateReferralLink } from "@/services/referral.services";
import { sendAccountVerificationEmail } from "@/utils/email";
import { buildError, sendError } from "@/utils/error";
import {
  INTERNAL_ERROR,
  INVALID_INPUT_ERROR,
  USER_ALREADY_EXISTS_ERROR,
} from "@/utils/error/error-codes";
import { isMongooseDuplicateKeyError } from "@/utils/mongoose.utils";

/**
 * Schema for referral promo signup
 * Simplified signup that auto-generates username and password
 */
const ReferralSignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  display_name: z.string().optional(),
  handle: z.string().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  newsletter_opt_in: z.boolean().optional().default(false),
  referral_code: z.string().optional(),
});

/**
 * POST /api/v1/referral/signup
 * Simplified signup for referral promo - creates account with auto-generated credentials
 */
export const POST = async (request: NextRequest) => {
  try {
    await connectToDatabase();
    const body = await request.json();

    const {
      email,
      display_name,
      handle,
      phone,
      source,
      newsletter_opt_in,
      referral_code,
    } = ReferralSignupSchema.parse(body);

    // Generate username from email or handle
    const baseUsername = handle || email.split("@")[0] || "user";
    let username = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, "");
    let usernameSuffix = 1;

    // Ensure username is unique
    while (await UserModel.findOne({ username })) {
      username = `${baseUsername}${usernameSuffix}`.toLowerCase();
      usernameSuffix++;
    }

    // Generate a random password (user can reset via email)
    const generatedPassword = nanoid(16);

    // Get location from IP
    const header = headers();
    let ip_address = header.get("CF-Connecting-IP");

    let location: string;
    if (ip_address === "::1" || !ip_address) {
      ip_address = "127.0.0.1";
      location = "Nigeria";
    } else {
      try {
        const mmdb = await getMMDB();
        const result = mmdb.get(ip_address);

        if (!result?.country?.names["en"]) {
          location = "Nigeria";
        } else {
          location = result?.country?.names["en"];
        }
      } catch {
        location = "Nigeria";
      }
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      // If user exists and has referral code, return their referral link
      if (existingUser.referral_code) {
        const referralLink = generateReferralLink(existingUser.referral_code);
        return NextResponse.json(
          {
            user: existingUser,
            referral_code: existingUser.referral_code,
            referral_link: referralLink,
            message: "Account already exists. Your referral link:",
            already_exists: true,
          },
          { status: 200 }
        );
      }

      // User exists but no referral code yet - generate one
      if (!existingUser.referral_code) {
        const referralCode = existingUser.username || existingUser.id.slice(0, 8);
        existingUser.referral_code = referralCode;
        await existingUser.save();

        const referralLink = generateReferralLink(referralCode);
        return NextResponse.json(
          {
            user: existingUser,
            referral_code: referralCode,
            referral_link: referralLink,
            message: "Account already exists. Your referral link has been generated:",
            already_exists: true,
          },
          { status: 200 }
        );
      }
    }

    // Hash the auto-generated password
    const { hashPassword } = await import("@/utils/password.utils");
    const hashedPassword = await hashPassword(generatedPassword);

    // Create user
    const createdUser = await UserModel.create({
      email: email.toLowerCase().trim(),
      username,
      display_name: display_name || username,
      password: hashedPassword,
      phone,
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
          message: "Failed to create account.",
          status: 500,
        })
      );
    }

    // Apply referral code if provided
    if (referral_code) {
      try {
        await applyReferralCode(referral_code, newId(createdUser.id));
      } catch (error) {
        console.error("Failed to apply referral code:", error);
        // Don't fail signup if referral code is invalid
      }
    }

    // Create session
    const session = await lucia.createSession(newId(createdUser.id), {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    // Generate and save referral code for new user
    const userReferralCode = username || createdUser.id.slice(0, 8);
    createdUser.referral_code = userReferralCode;
    await createdUser.save();

    // Generate OTP for email verification
    const totp = generateEmailOTP(createdUser.email);

    // Send verification email (with password reset link)
    await sendAccountVerificationEmail(createdUser, totp);

    // Subscribe to newsletter if opted in
    if (newsletter_opt_in) {
      try {
        const existingSubscriber = await SubscriberModel.findOne({
          email_address: email,
        });

        if (!existingSubscriber) {
          const newSubscriber = new SubscriberModel({
            email_address: email,
            name: display_name || username,
            global_status: "active",
            is_verified: true,
            verified_at: new Date(),
            status_updated_at: new Date(),
          });
          await newSubscriber.save();

          // Send newsletter welcome email (non-blocking)
          try {
            const { sendNewsletterWelcomeEmail } = await import("@/utils/email");
            await sendNewsletterWelcomeEmail({
              email: email,
              display_name: display_name || username,
            });
          } catch (emailError) {
            console.error("Newsletter welcome email error:", emailError);
          }
        }
      } catch (subscriberError) {
        console.error("Failed to subscribe to newsletter:", subscriberError);
        // Don't fail signup if newsletter subscription fails
      }
    }

    const referralLink = generateReferralLink(userReferralCode);

    return NextResponse.json(
      {
        user: createdUser,
        referral_code: userReferralCode,
        referral_link: referralLink,
        message: "Account created successfully! Check your email to verify and set your password.",
      },
      {
        status: 201,
        headers: { "Set-Cookie": sessionCookie.serialize() },
      }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return sendError(
        buildError({
          code: INVALID_INPUT_ERROR,
          message: "Invalid input.",
          status: 422,
          data: error as ZodError,
        })
      );
    }

    if (isMongooseDuplicateKeyError(error)) {
      return sendError(
        buildError({
          code: USER_ALREADY_EXISTS_ERROR,
          message: "An account with this email already exists.",
          status: 422,
        })
      );
    }

    return sendError(
      buildError({
        code: INTERNAL_ERROR,
        message: error instanceof Error ? error.message : "An error occurred.",
        status: 500,
        data: error,
      })
    );
  }
};
