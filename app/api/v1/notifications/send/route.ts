import { NextResponse } from "next/server";
import connectionManager from "@/lib/connection-manager";
import { findSubscriptionsByUserId } from "@/database/subscription/subscription.repository";
import { webPush } from "@/lib/web-push";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { userId, notification } = await request.json();

    if (!userId || !notification) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 },
      );
    }

    await connectionManager.sendNotification(userId, {
      ...notification,
      timestamp: Date.now(),
    });

    const subscriptions = await findSubscriptionsByUserId(userId);
    for (const subscription of subscriptions) {
      await webPush.sendNotification(
        subscription,
        JSON.stringify(notification),
      );
    }

    return NextResponse.json(
      { message: "Notification sent." },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error sending notification:", error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
}
