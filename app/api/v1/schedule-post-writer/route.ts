import { NextRequest, NextResponse } from "next/server";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { IDraft } from "@/types/draft.type";
import {
  scheduleDraft,
  updateDraft,
  getDraftById,
} from "@/database/draft/draft.repository";
import { validateRequest } from "@/lib/auth/auth";

interface SchedulePostRequest {
  draftId: string;
  scheduled_at: string; // ISO date string
}

export const POST = async (request: NextRequest) => {
  try {
    const { draftId, scheduled_at }: SchedulePostRequest = await request.json();

    await connectToDatabase();
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    // Check if the user is NOT a freelance writer (regular writer)
    if (user.role === "freelance_writer") {
      return NextResponse.json(
        {
          message:
            "Unauthorized - freelance writers should use the freelancer endpoint",
        },
        { status: 403 },
      );
    }

    // Fetch the draft from database to ensure we have the latest version
    const draft = await getDraftById(draftId);
    if (!draft) {
      return NextResponse.json({ message: "Draft not found" }, { status: 404 });
    }

    // Check if the draft belongs to the current user (for security)
    if (draft.user_id.toString() !== user.id.toString()) {
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

    // Update the draft to mark it as scheduled for automatic publishing
    const updatedDraft = await updateDraft(draft._id?.toString(), {
      scheduled_at: new Date(scheduled_at),
      isScheduled: true,
      published: false,
      moderationStatus: "scheduled", // Set to scheduled to show clock icon
      schedule_publish_type: "automatic", // Automatic publishing - no approval needed
    });

    if (!updatedDraft) {
      return NextResponse.json(
        { message: "Failed to schedule draft" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Draft scheduled for automatic publishing successfully",
      draft: updatedDraft,
    });
  } catch (error) {
    console.error(`Error scheduling draft for publishing: ${error}`);
    return NextResponse.json(
      { message: "Error scheduling draft for automatic publishing" },
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

    // Check if the user is NOT a freelance writer (regular writer)
    if (user.role === "freelance_writer") {
      return NextResponse.json(
        {
          message:
            "Unauthorized - freelance writers should use the freelancer endpoint",
        },
        { status: 403 },
      );
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

    const updatedDraft = await updateDraft(draftId, {
      scheduled_at: new Date(scheduled_at),
    });

    if (!updatedDraft) {
      return NextResponse.json(
        { message: "Failed to update scheduled draft" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Scheduled draft for automatic publishing updated successfully",
      draft: updatedDraft,
    });
  } catch (error) {
    console.error(`Error updating scheduled draft: ${error}`);
    return NextResponse.json(
      { message: "Error updating scheduled draft for automatic publishing" },
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

    // Check if the user is NOT a freelance writer (regular writer)
    if (user.role === "freelance_writer") {
      return NextResponse.json(
        {
          message:
            "Unauthorized - freelance writers should use the freelancer endpoint",
        },
        { status: 403 },
      );
    }

    // Verify the draft belongs to the user
    const draft = await getDraftById(draftId);
    if (!draft) {
      return NextResponse.json({ message: "Draft not found" }, { status: 404 });
    }

    if (draft.user_id !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Update the draft to remove scheduling and return to draft status
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
      message:
        "Scheduled draft for automatic publishing cancelled successfully",
      draft: updatedDraft,
    });
  } catch (error) {
    console.error(`Error cancelling scheduled draft: ${error}`);
    return NextResponse.json(
      { message: "Error cancelling scheduled draft for automatic publishing" },
      { status: 500 },
    );
  }
};
