import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/database/user/user.model";
import WriterRequestModel from "@/database/writer-request/writer-request.model";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const decision: "approved" | "rejected" = await request.json();

    if (!decision) {
      return NextResponse.json({ error: "Missing decision" }, { status: 400 });
    }

    if (decision !== "approved" && decision !== "rejected") {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    }

    const writerRequest = await WriterRequestModel.findById(params.id).lean();

    if (!writerRequest) {
      return NextResponse.json(
        { error: "Writer request not found" },
        { status: 404 },
      );
    }

    if (decision === "approved") {
      await UserModel.findByIdAndUpdate(writerRequest?.user_id, {
        $set: { upgrade_pending: false, role: "writer" },
      });
    } else {
      await UserModel.findByIdAndUpdate(writerRequest?.user_id, {
        $set: { upgrade_pending: false },
      });
    }
    await WriterRequestModel.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(`Error deleting writer request: ${error}`);
    NextResponse.json(
      { error: "Failed to delete writer request" },
      { status: 500 },
    );
  }
}
