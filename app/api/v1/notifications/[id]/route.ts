import NotificationModel from "@/database/notification/notification.model";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();

    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notification = await NotificationModel.findOne({
      _id: params.id,
      recipient: user.id,
    });

    if (!notification) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const body = await request.json();

    if (body.action === "markAsRead") {
      await notification.markAsRead();
    } else if (body.action === "archive") {
      await notification.archive();
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Notification PATCH error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
