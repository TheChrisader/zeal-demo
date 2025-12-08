import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import EmailSubscriptionModel from "@/database/email-subscription/email-subscription.model";
import SubscriberModel from "@/database/subscriber/subscriber.model";
import { connectToDatabase } from "@/lib/database";

const unsubscribeSchema = z.object({
  reason: z.string().optional(),
});

async function processUnsubscribe(
  params: { id: string },
  reason?: string,
): Promise<{
  success: boolean;
  message: string;
  subscriberId?: string;
  unsubscribedAt?: Date;
  subscriptionsUpdated?: number;
}> {
  const session = await mongoose.startSession();

  try {
    // Validate subscriber ID format
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid subscriber ID format",
      };
    }

    await connectToDatabase();

    // Start transaction for atomicity
    session.startTransaction();

    const now = new Date();
    const unsubscribeReason = reason || "User requested unsubscribe via API";

    // Find subscriber
    const subscriber = await SubscriberModel.findById(id).session(session);
    if (!subscriber) {
      await session.abortTransaction();
      session.endSession();

      return {
        success: false,
        message: "Subscriber not found",
      };
    }

    // Check if already unsubscribed (idempotent operation)
    if (subscriber.global_status === "unsubscribed") {
      await session.abortTransaction();
      session.endSession();

      return {
        success: true,
        message: "Subscriber is already unsubscribed",
        subscriberId: id,
        unsubscribedAt: subscriber.status_updated_at,
        subscriptionsUpdated: 0,
      };
    }

    // Update subscriber global status
    await SubscriberModel.findByIdAndUpdate(
      id,
      {
        $set: {
          global_status: "unsubscribed",
          status_updated_at: now,
          status_reason: unsubscribeReason,
        },
      },
      { session },
    );

    // Find and update all email subscriptions for this subscriber
    const updateResult = await EmailSubscriptionModel.updateMany(
      {
        subscriber_id: id,
        status: "subscribed",
      },
      {
        $set: {
          status: "unsubscribed",
          unsubscribed_at: now,
          updated_at: now,
        },
      },
      { session },
    );

    const subscriptionsUpdated = updateResult.modifiedCount || 0;

    // Commit transaction
    await session.commitTransaction();

    return {
      success: true,
      message: "Successfully unsubscribed from all newsletters",
      subscriberId: id,
      unsubscribedAt: now,
      subscriptionsUpdated: subscriptionsUpdated,
    };
  } catch (error) {
    // Rollback transaction on error
    try {
      await session.abortTransaction();
    } catch (rollbackError) {
      console.error("Transaction rollback failed:", rollbackError);
    }

    console.error("Unsubscribe operation failed:", error);

    return {
      success: false,
      message: "Failed to process unsubscribe request",
    };
  } finally {
    // Always end the session
    session.endSession();
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const result = await processUnsubscribe(params);

  if (!result.success) {
    if (result.message.includes("Invalid subscriber ID format")) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    } else if (result.message.includes("Subscriber not found")) {
      return NextResponse.json({ message: result.message }, { status: 404 });
    } else {
      return NextResponse.json({ message: result.message }, { status: 500 });
    }
  }

  // Return HTML confirmation page for GET requests
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Unsubscribe Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          margin-top: 50px;
        }
        .success {
          color: #28a745;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .info {
          color: #6c757d;
          font-size: 16px;
        }
        .details {
          background-color: #e9ecef;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
          text-align: left;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success">✓ Successfully Unsubscribed</div>
        <p class="info">
          ${result.message.includes("already") ? result.message : "You have been successfully unsubscribed from all newsletters."}
        </p>
        ${
          result.subscriptionsUpdated !== undefined
            ? `
        <div class="details">
          <strong>Unsubscribe Details:</strong><br>
          • Subscriber ID: ${result.subscriberId}<br>
          • Unsubscribed at: ${result.unsubscribedAt?.toLocaleString()}<br>
          • Subscriptions updated: ${result.subscriptionsUpdated}
        </div>
        `
            : ""
        }
        <p class="info">
          You will no longer receive emails from our newsletter service.
        </p>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  // Parse request body - completely optional, don't fail on any parsing errors
  let reason = undefined;
  try {
    const body = await request.json();
    const validation = unsubscribeSchema.safeParse(body);
    if (validation.success && validation.data.reason) {
      reason = validation.data.reason;
    }
  } catch {
    // Ignore any JSON parsing errors - body is completely optional
  }

  const result = await processUnsubscribe(params, reason);

  if (!result.success) {
    if (result.message.includes("Invalid subscriber ID format")) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    } else if (result.message.includes("Subscriber not found")) {
      return NextResponse.json({ message: result.message }, { status: 404 });
    } else {
      return NextResponse.json({ message: result.message }, { status: 500 });
    }
  }

  // Return 204 No Content for successful POST requests
  return new NextResponse(null, { status: 204 });
}
