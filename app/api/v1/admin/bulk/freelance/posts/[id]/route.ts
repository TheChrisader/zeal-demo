import { NextRequest, NextResponse } from "next/server";
import {
  deleteDraftById,
  getDraftById,
  updateDraft,
} from "@/database/draft/draft.repository";
import { createPostFromDraft } from "@/database/post/post.repository";
import { connectToDatabase } from "@/lib/database";
import UserModel from "@/database/user/user.model";
import { IDraft } from "@/types/draft.type";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    await connectToDatabase();

    const draft = await getDraftById(params.id);

    if (!draft) {
      return NextResponse.json({ message: "Draft not found" }, { status: 404 });
    }

    const user = await UserModel.findById(draft?.user_id);
    (draft as IDraft & { user_name?: string }).user_name = user?.display_name;

    return NextResponse.json(draft);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    await connectToDatabase();

    const body = await req.json();

    const draft = await getDraftById(params.id);
    if (!draft) {
      return NextResponse.json({ message: "Draft not found" }, { status: 404 });
    }
    if (body.moderationStatus === "published") {
      await createPostFromDraft(draft);
      // await updateDraft(params.id, { moderationStatus: "published" });
      // await deleteDraftById(params.id);
      // return NextResponse.json({ message: "Draft published successfully" });
    }

    const updatedDraft = await updateDraft(params.id, body);

    return NextResponse.json(updatedDraft);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    await connectToDatabase();

    await updateDraft(params.id, { moderationStatus: "rejected" });

    return NextResponse.json({ message: "Draft rejected successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};
