import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { createPreferences } from "@/database/preferences/preferences.repository";
import { ReferralCodeSchema } from "@/database/referral/referral.dto";
import { applyReferralCode } from "@/database/referral/referral.repository";
import SubscriberModel from "@/database/subscriber/subscriber.model";
import { SignUpUserSchema } from "@/database/user/user.dto";
import { createUser, findUserByEmail } from "@/database/user/user.repository";
import { lucia } from "@/lib/auth/auth";
import { connectToDatabase, newId } from "@/lib/database";
import { createChildLogger } from "@/lib/logger";
import { generateEmailOTP } from "@/lib/otp";
import {
  sendAccountVerificationEmail,
  sendNewsletterWelcomeEmail,
} from "@/utils/email";
import { buildError, sendError } from "@/utils/error";
import {
  INTERNAL_ERROR,
  INVALID_INPUT_ERROR,
  USER_ALREADY_EXISTS_ERROR,
} from "@/utils/error/error-codes";
import { hashPassword } from "@/utils/password.utils";

const logger = createChildLogger("auth-signup");

// TODO: case sensitive usernames? Search user by both email and username to find if
// they exist

export const POST = async (request: NextRequest) => {
  try {
    await connectToDatabase();
    const body = await request.json();

    const SignUpSchema = SignUpUserSchema.merge(ReferralCodeSchema)
      .setKey("password", z.string().min(8, "At least 8 characters."))
      .merge(
        z.object({
          newsletter_opt_in: z.boolean().optional().default(false),
          phone: z.string().optional(),
          source: z.string().optional(),
          terms_accepted: z.boolean().optional().default(false),
        }),
      );
    const {
      email,
      username,
      password,
      display_name,
      referral_code,
      newsletter_opt_in,
      phone,
      source,
      terms_accepted,
    } = SignUpSchema.parse(body);
    logger.info({ email, username }, "Signup schema parsed");

    // get ip from request
    const header = headers();
    let ip_address = header.get("CF-Connecting-IP");

    const location: string = "Nigeria";
    if (ip_address === "::1" || !ip_address) {
      ip_address = "127.0.0.1";
      // location = "Nigeria";
    }
    // else {
    //   const mmdb = await getMMDB();
    //   const result = mmdb.get(ip_address);

    //   if (!result?.country?.names["en"]) {
    //     location = "Nigeria";
    //   } else {
    //     location = result?.country?.names["en"];
    //   }
    // }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      logger.warn({ email }, "Signup attempted with existing email");
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
      ip_address: ip_address || undefined,
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
        logger.warn(
          { referral_code, userId: createdUser.id },
          "Failed to apply referral code",
        );
        // Don't fail signup if referral code is invalid
      }
    }

    // Store referral metadata if provided (phone, source, terms_accepted)
    if (phone || source || terms_accepted) {
      try {
        const ReferralSignupModel = await import(
          "@/database/referral-signup/referral-signup.model"
        );
        await ReferralSignupModel.default.create({
          user_id: createdUser.id,
          phone: phone || null,
          source: source || null,
          terms_accepted: terms_accepted || false,
          promo_campaign: "referral-promo-2",
          signed_up_at: new Date(),
        });
      } catch (error) {
        logger.warn(
          { userId: createdUser.id },
          "Failed to store referral metadata",
        );
        // Don't fail signup if metadata storage fails
      }
    }

    // Handle newsletter opt-in
    if (newsletter_opt_in) {
      try {
        const existingSubscriber = await SubscriberModel.findOne({
          email_address: email,
        });

        if (!existingSubscriber) {
          const newSubscriber = new SubscriberModel({
            email_address: email,
            name: display_name,
            global_status: "active",
            is_verified: true,
            verified_at: new Date(),
            status_updated_at: new Date(),
          });
          await newSubscriber.save();

          // Send newsletter welcome email (non-blocking)
          try {
            await sendNewsletterWelcomeEmail({
              email: email,
              display_name: display_name,
            });
          } catch (emailError) {
            logger.warn(
              { email, userId: createdUser.id },
              "Newsletter welcome email error",
            );
          }
        }
      } catch (subscriberError) {
        logger.warn(
          { email, userId: createdUser.id },
          "Failed to subscribe to newsletter",
        );
        // Don't fail signup if newsletter subscription fails
      }
    }

    logger.info(
      { userId: createdUser.id, username, email },
      "User created successfully",
    );

    const session = await lucia.createSession(newId(createdUser.id), {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    const totp = generateEmailOTP(createdUser.email);

    await sendAccountVerificationEmail(createdUser, totp);

    return NextResponse.json(createdUser, {
      status: 201,
      headers: { "Set-Cookie": sessionCookie.serialize() },
    });
  } catch (error: unknown) {
    logger.error(error, "Signup error");
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
