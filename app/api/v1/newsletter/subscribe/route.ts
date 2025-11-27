import { serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import SubscriberModel from "@/database/subscriber/subscriber.model";
import UserModel from "@/database/user/user.model";
import { connectToDatabase } from "@/lib/database";
import { isMongooseDuplicateKeyError } from "@/utils/mongoose.utils";
import { sendNewsletterWelcomeEmail } from "@/utils/email";

const subscribeSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase;

    const body = await request.json();
    const validation = subscribeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid input.", errors: validation.error.format() },
        { status: 400 },
      );
    }

    const { email, name } = validation.data;

    const existingSubscriber = await SubscriberModel.findOne({
      email_address: email,
    });

    if (existingSubscriber) {
      if (name && name !== existingSubscriber.name) {
        existingSubscriber.name = name;
        await existingSubscriber.save();
      }

      const cookie = serialize("zealnews_subscribed_newsletter", "true", {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });

      const response = NextResponse.json(
        { message: "You are already subscribed. Access granted." },
        { status: 200 },
      );

      response.headers.set("Set-Cookie", cookie);
      return response;
    }

    const newSubscriber = new SubscriberModel({
      email_address: email,
      name: name,
      global_status: "active",
      is_verified: true,
      verified_at: new Date(),
      status_updated_at: new Date(),
    });
    await newSubscriber.save();

    // Send welcome email to new subscribers (non-blocking)
    try {
      // Check if email is registered to a user to get their name
      const existingUser = await UserModel.findOne({ email: email }).select('display_name');

      await sendNewsletterWelcomeEmail({
        email: email,
        display_name: existingUser ? existingUser.display_name : undefined,
      });
    } catch (emailError) {
      console.error("Newsletter welcome email error: ", emailError);
      // Don't fail the subscription if email fails
    }

    const subscriptionCookie = serialize(
      "zealnews_subscribed_newsletter",
      "true",
      {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      },
    );

    const response = NextResponse.json(
      { message: "Successfully subscribed!", subscriber: newSubscriber },
      { status: 201 },
    );
    response.headers.set("Set-Cookie", subscriptionCookie);
    return response;
  } catch (error: unknown) {
    console.error("Subscription API Error: ", error);
    let errorMessage = "Internal Server Error";
    if (isMongooseDuplicateKeyError(error)) {
      const cookie = serialize("zealnews_subscribed_newsletter", "true", {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
      const response = NextResponse.json(
        { message: "You are already subscribed. Access granted." },
        { status: 200 },
      );
      response.headers.set("Set-Cookie", cookie);
      return response;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
