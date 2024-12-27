import { NextResponse } from "next/server";
import NotificationModel from "@/database/notification/notification.model";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";

export async function POST() {
  try {
    await connectToDatabase();
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await NotificationModel.updateMany(
      {
        recipient: user.id,
        "status.isRead": false,
        "status.isArchived": false,
      },
      {
        $set: {
          "status.isRead": true,
          "status.readAt": new Date(),
        },
      },
    );

    return NextResponse.json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all read POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
