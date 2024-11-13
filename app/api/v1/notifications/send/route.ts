import { NextResponse } from "next/server";
import { ConnectionManager } from "@/lib/connection-manager";

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

    const connectionManager = ConnectionManager.getInstance();
    await connectionManager.sendNotification(userId, {
      ...notification,
      timestamp: Date.now(),
    });

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
