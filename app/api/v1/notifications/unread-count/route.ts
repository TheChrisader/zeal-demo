import { Model } from "mongoose";
import { NextResponse } from "next/server";
import NotificationModel from "@/database/notification/notification.model";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase, Id } from "@/lib/database";
import { INotification } from "@/types/notification.type";

interface NotificationModel extends Model<INotification> {
  getUnreadCount(userId: Id): Promise<number>;
}

export async function GET() {
  try {
    await connectToDatabase();
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await (NotificationModel as NotificationModel).getUnreadCount(
      user.id as Id,
    );

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Unread count GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
