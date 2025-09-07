// app/api/subscribe/route.ts
import MailerLite from "@mailerlite/mailerlite-nodejs";
import { serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import SubscriberModel from "@/database/subscriber/subscriber.model";
import { connectToDatabase } from "@/lib/database";

// Zod schema for request body validation
const subscribeSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  categories: z.array(z.string()).optional(),
  //   source: z.string().min(1, { message: "Source is required" }),
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

    const { email, categories } = validation.data;

    const mailerlite = new MailerLite({
      api_key: process.env.MAILERLITE_API_KEY as string,
    });

    // Check if email already exists
    const existingSubscriber = await SubscriberModel.findOne({ email });
    if (existingSubscriber) {
      // Optionally, update existing subscriber's categories or source if needed
      // For now, we'll just consider it a successful "re-subscription" for cookie purposes
      // but not create a duplicate entry.
      // existingSubscriber.selectedCategories = categories || existingSubscriber.selectedCategories;
      // existingSubscriber.source = source; // Or maybe log multiple sources
      // await existingSubscriber.save();

      // Set cookie even if already subscribed to ensure access
      const cookie = serialize("zealnews_subscribed_newsletter", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
      const response = NextResponse.json(
        { message: "You are already subscribed. Access granted." },
        { status: 200 },
      );
      response.headers.set("Set-Cookie", cookie);
      return response;
    }

    // Create new subscriber
    const newSubscriber = new SubscriberModel({
      email,
      selectedCategories: categories,
      //   source,
    });
    await newSubscriber.save();

    await mailerlite.subscribers.createOrUpdate({
      email,
    });

    // Set the subscription cookie
    const subscriptionCookie = serialize(
      "zealnews_subscribed_newsletter",
      "true",
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
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
    // Handle Mongoose duplicate key error (for email) specifically
    if (error.code === 11000) {
      // This case should ideally be caught by `existingSubscriber` check above,
      // but this is a fallback.
      const cookie = serialize("zealnews_subscribed_newsletter", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
      const response = NextResponse.json(
        { message: "You are already subscribed. Access granted." },
        { status: 200 }, // Or 409 Conflict if you prefer
      );
      response.headers.set("Set-Cookie", cookie);
      return response;
    }
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 },
    );
  }
}
