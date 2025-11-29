import { serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CATEGORIES } from "@/categories/flattened";
import EmailSubscriptionModel from "@/database/email-subscription/email-subscription.model";
import SubscriberModel from "@/database/subscriber/subscriber.model";
import { connectToDatabase } from "@/lib/database";
import { isMongooseDuplicateKeyError } from "@/utils/mongoose.utils";

const subscriptionSchema = z.object({
  email_address: z.string().email("Valid email address is required"),
  list_ids: z
    .array(z.string().min(1))
    .min(1, "At least one list ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const validation = subscriptionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid input.", errors: validation.error.format() },
        { status: 400 },
      );
    }

    const { email_address, list_ids } = validation.data;

    // Check if subscriber exists
    const subscriber = await SubscriberModel.findOne({ email_address });
    if (!subscriber) {
      return NextResponse.json(
        { message: "Subscriber not found" },
        { status: 404 },
      );
    }

    // Check if all list_ids are valid categories from flattened categories
    const invalidListIds = list_ids.filter(
      (listId) => !CATEGORIES.some((category) => category === listId),
    );
    if (invalidListIds.length > 0) {
      return NextResponse.json(
        {
          message: "Invalid list IDs found.",
          invalidListIds,
          validCategories: CATEGORIES,
        },
        { status: 400 },
      );
    }

    // Create email subscriptions for each list_id
    const subscriptions = [];
    const errors = [];

    for (const listId of list_ids) {
      try {
        const newSubscription = new EmailSubscriptionModel({
          subscriber_id: subscriber._id,
          list_id: listId,
          status: "subscribed",
          subscribed_at: new Date(),
        });

        await newSubscription.save();
        subscriptions.push(newSubscription);
      } catch (error) {
        if (isMongooseDuplicateKeyError(error)) {
          errors.push({ listId, error: "Already subscribed to this list" });
        } else {
          throw error; // Re-throw non-duplicate errors
        }
      }
    }

    const response = NextResponse.json(
      {
        message: `Processed ${list_ids.length} list subscriptions. Created ${subscriptions.length} new subscriptions.`,
        email_address,
        subscriptions,
        errors,
        totalRequested: list_ids.length,
        successfulSubscriptions: subscriptions.length,
        errorsCount: errors.length,
      },
      { status: 201 },
    );

    // Set cookie if at least one subscription was successful
    if (subscriptions.length > 0) {
      const cookie = serialize("zealnews_preferences_selected", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });

      response.headers.set("Set-Cookie", cookie);
    }

    return response;
  } catch (error: unknown) {
    console.error("Email subscription creation error: ", error);

    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
