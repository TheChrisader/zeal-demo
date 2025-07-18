import { NextRequest, NextResponse } from "next/server";
import { getDraftById, updateDraft } from "@/database/draft/draft.repository";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" });
    }

    const { id } = params;

    const draft = await getDraftById(id);

    if (!draft) {
      return NextResponse.json({ message: "Draft not found" });
    }

    if (draft?.user_id.toString() !== user.id.toString()) {
      return NextResponse.json({ message: "Access Forbidden" });
    }

    const newDraft = await updateDraft(id, {
      moderationStatus: "awaiting_approval",
    });

    return NextResponse.json(newDraft);
  } catch (error) {
    console.log(`Error pushing draft: ${error}`);
    return NextResponse.json({ message: "Error pushing draft" });
  }
};
