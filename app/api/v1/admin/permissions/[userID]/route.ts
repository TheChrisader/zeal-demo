import { NextRequest, NextResponse } from "next/server";
import {
  deletePermission,
  findPermissionsByUserId,
  updatePermissions,
} from "@/database/permission/permission.repository";
import { validatePermission } from "@/utils/permissions.utils";
import { connectToDatabase } from "@/lib/database";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    await connectToDatabase();
    const result = await findPermissionsByUserId(params.userId);
    if (!result) {
      return NextResponse.json(
        { error: "Permissions not found" },
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
  { params }: { params: { userID: string } },
) {
  try {
    const { permissions } = await req.json();

    if (!permissions.every(validatePermission)) {
      return NextResponse.json(
        { error: "Invalid permission format" },
        { status: 400 },
      );
    }

    const result = await updatePermissions(params.userID, permissions);
    if (!result) {
      return NextResponse.json(
        { error: "Permissions not found" },
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
  { params }: { params: { userId: string } },
) {
  try {
    const result = await deletePermission(params.userId);
    if (!result) {
      return NextResponse.json(
        { error: "Permissions not found" },
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
