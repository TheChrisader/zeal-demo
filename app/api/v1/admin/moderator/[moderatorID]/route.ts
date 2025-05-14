import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { validatePermission } from "@/utils/permissions.utils";
import {
  deleteModerator,
  findModeratorById,
  updateModerator,
} from "@/database/moderator/moderator.repository";
import { hashPassword } from "@/utils/password.utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { moderatorId: string } },
) {
  try {
    await connectToDatabase();
    const result = await findModeratorById(params.moderatorId);
    if (!result) {
      return NextResponse.json(
        { error: "Moderator not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { moderatorID: string } },
) {
  try {
    const { name, email, password, permissions } = await req.json();
    let hashedPassword: string | undefined = undefined;

    if (!permissions.every(validatePermission)) {
      return NextResponse.json(
        { error: "Invalid permission format" },
        { status: 400 },
      );
    }

    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters long" },
          { status: 400 },
        );
      }

      hashedPassword = await hashPassword(password);
    }

    await connectToDatabase();

    const result = await updateModerator(params.moderatorID, {
      name,
      email,
      password_hash: hashedPassword,
      permissions,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Moderator not updated" },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { moderatorId: string } },
) {
  try {
    const result = await deleteModerator(params.moderatorId);
    if (!result) {
      return NextResponse.json(
        { error: "Moderator not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
