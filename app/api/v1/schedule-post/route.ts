import { NextRequest, NextResponse } from "next/server";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { IDraft } from "@/types/draft.type";
import { scheduleDraft, updateDraft } from "@/database/draft/draft.repository";
import { getDraftById } from "@/database/draft/draft.repository";

interface SchedulePostRequest {
  draft: IDraft;
  scheduled_at: string; // ISO date string
}

export const POST = async (request: NextRequest) => {
  try {
    const { draft, scheduled_at }: SchedulePostRequest = await request.json();

    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    // Check if the draft belongs to the current user (for security)
    if (draft.user_id !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Validate that the scheduled time is in the future
    const scheduledDate = new Date(scheduled_at);
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { message: "Scheduled time must be in the future" },
        { status: 400 },
      );
    }

    // Update the draft to mark it as scheduled
    const scheduledDraft = await scheduleDraft(
      draft._id?.toString(),
      scheduledDate,
    );

    if (!scheduledDraft) {
      return NextResponse.json(
        { message: "Failed to schedule draft" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Draft scheduled successfully",
      draft: scheduledDraft,
    });
  } catch (error) {
    console.error(`Error scheduling draft: ${error}`);
    return NextResponse.json(
      { message: "Error scheduling draft" },
      { status: 500 },
    );
  }
};

export const PATCH = async (request: NextRequest) => {
  try {
    const { draftId, scheduled_at } = await request.json();

    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    // Verify the draft belongs to the user
    const draft = await getDraftById(draftId);
    if (!draft) {
      return NextResponse.json({ message: "Draft not found" }, { status: 404 });
    }

    if (draft.user_id !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Validate that the scheduled time is in the future
    const scheduledDate = new Date(scheduled_at);
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { message: "Scheduled time must be in the future" },
        { status: 400 },
      );
    }

    const updatedDraft = await scheduleDraft(draftId, scheduledDate);

    if (!updatedDraft) {
      return NextResponse.json(
        { message: "Failed to update scheduled draft" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Scheduled draft updated successfully",
      draft: updatedDraft,
    });
  } catch (error) {
    console.error(`Error updating scheduled draft: ${error}`);
    return NextResponse.json(
      { message: "Error updating scheduled draft" },
      { status: 500 },
    );
  }
};

export const DELETE = async (request: NextRequest) => {
  try {
    const { draftId } = await request.json();

    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    // Verify the draft belongs to the user
    const draft = await getDraftById(draftId);
    if (!draft) {
      return NextResponse.json({ message: "Draft not found" }, { status: 404 });
    }

    if (draft.user_id !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Update the draft to remove scheduling
    const updatedDraft = await updateDraft(draftId, {
      isScheduled: false,
      scheduled_at: undefined,
      moderationStatus: "draft",
    });

    if (!updatedDraft) {
      return NextResponse.json(
        { message: "Failed to cancel scheduled draft" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Scheduled draft cancelled successfully",
      draft: updatedDraft,
    });
  } catch (error) {
    console.error(`Error cancelling scheduled draft: ${error}`);
    return NextResponse.json(
      { message: "Error cancelling scheduled draft" },
      { status: 500 },
    );
  }
};
