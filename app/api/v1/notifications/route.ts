import { NextRequest, NextResponse } from "next/server";
import NotificationModel from "@/database/notification/notification.model";
import { validateRequest } from "@/lib/auth/auth";
import { Id } from "@/lib/database";
import UserModel from "@/database/user/user.model";

export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return new Response(null, {
        status: 401,
        statusText: "Unauthorized",
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const isRead = searchParams.get("isRead");

    const query = {
      recipient: user.id as Id,
      ...(type && { type }),
      ...(isRead !== null && { "status.isRead": isRead === "true" }),
      "status.isArchived": false,
    };

    const [notifications, total] = await Promise.all([
      NotificationModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate<{ actors: { name: string; avatar: string }[] }>(
          "actors",
          "name avatar",
          UserModel,
        )
        .lean(),
      NotificationModel.countDocuments(query),
    ]);

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
