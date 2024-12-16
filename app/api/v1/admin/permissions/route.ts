import { NextRequest, NextResponse } from "next/server";
import { validatePermission } from "@/utils/permissions.utils";
import { connectToDatabase } from "@/lib/database";
import { createPermission } from "@/database/permission/permission.repository";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { user_id, permissions } = body;

    // Validate permissions format
    if (!permissions.every(validatePermission)) {
      return NextResponse.json(
        { error: "Invalid permission format" },
        { status: 400 },
      );
    }

    const result = await createPermission({ user_id, permissions });
    return NextResponse.json(result);
  } catch (error) {
    //   if (error.name === 'PermissionError') {
    //     return NextResponse.json(
    //       { error: error.message },
    //       { status: 400 }
    //     );
    //   }
    console.log(`Error creating permission: ${error}`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
