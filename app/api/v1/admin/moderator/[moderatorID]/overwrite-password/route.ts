import { NextRequest, NextResponse } from "next/server";
import {
  findModeratorById,
  updateModerator,
} from "@/database/moderator/moderator.repository";
import { connectToDatabase } from "@/lib/database";
import { verifyToken } from "@/lib/jwt";
import { hashPassword } from "@/utils/password.utils";
import { hasPermission } from "@/utils/permissions.utils";

export async function POST(
  request: NextRequest,
  { params }: { params: { moderatorID: string } },
) {
  try {
    await connectToDatabase();

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header missing" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token || "");

    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userPermissions = (payload.permissions as string[]) || [];
    const hasWritePermission =
      hasPermission(userPermissions, "moderators:write") ||
      hasPermission(userPermissions, "admin:all");

    if (!hasWritePermission) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const moderatorExists = await findModeratorById(params.moderatorID);
    if (!moderatorExists) {
      return NextResponse.json(
        { error: "Moderator not found" },
        { status: 404 },
      );
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const result = await updateModerator(params.moderatorID, {
      password_hash: hashedPassword,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
