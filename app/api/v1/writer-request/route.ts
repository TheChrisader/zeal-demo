import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/database/user/user.model";
import { findUserById } from "@/database/user/user.repository";
import { createWriterRequest } from "@/database/writer-request/writer-request.repository";
import { validateRequest } from "@/lib/auth/auth";

export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingWriter = await findUserById(user.id);

    if (!pendingWriter) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const writerRequest = await request.json();

    if (writerRequest.user_id !== user.id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await createWriterRequest(writerRequest);

    await UserModel.findByIdAndUpdate(user.id, {
      $set: { upgrade_pending: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(`Error creating writer request: ${error}`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
