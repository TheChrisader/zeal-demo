import { NextRequest, NextResponse } from "next/server";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { IDraft } from "@/types/draft.type";
import { findPostOrDraftById } from "@/utils/findPostOrDraft";
import { IPost } from "@/types/post.type";

export const GET = async (
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

    const doc = await findPostOrDraftById(id);

    if (!doc) {
      return NextResponse.json({ message: "Document not found" });
    }

    if (
      (doc.published === false &&
        (doc as IDraft)?.user_id.toString() !== user.id.toString()) ||
      (doc.published === true &&
        (doc as IPost)?.author_id.toString() !== user.id.toString())
    ) {
      return NextResponse.json({ message: "Access Forbidden" });
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.log(`Error getting document: ${error}`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
