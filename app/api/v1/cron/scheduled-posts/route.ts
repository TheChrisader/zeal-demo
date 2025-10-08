import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { createPostFromDraft } from "@/database/post/post.repository";
import {
  getScheduledDrafts,
  updateDraft,
} from "@/database/draft/draft.repository";
import { IDraft } from "@/types/draft.type";
import { IPost } from "@/types/post.type";
import { pushDraftForApproval } from "@/services/draft.services";

// This is a simple implementation of a scheduled post processor
// In production, you'd want to use a more robust job queue system
export const processScheduledPosts = async () => {
  try {
    await connectToDatabase();

    // Get all scheduled drafts that are due to be published
    const scheduledDrafts = await getScheduledDrafts();
    let totalProcessed = 0;

    for (const draft of scheduledDrafts) {
      try {
        if (draft.schedule_publish_type === "manual") {
          // Freelance writer flow: push for approval
          await pushDraftForApproval(draft._id?.toString());

          // Update the draft to remove scheduling flags
          await updateDraft(draft._id?.toString(), {
            isScheduled: false,
            scheduled_at: undefined,
          });

          console.log(
            `Successfully pushed scheduled draft ${draft._id?.toString()} for approval: ${draft.title}`,
          );
        } else if (draft.schedule_publish_type === "automatic") {
          // Regular writer flow: publish immediately
          const newPost: IPost = await createPostFromDraft({
            ...draft,
            published: true, // Mark as published now
          });

          // Update the draft status to published
          await updateDraft(draft._id?.toString(), {
            moderationStatus: "published",
            published: true,
            isScheduled: false, // Remove scheduling status since it's now published
            scheduled_at: undefined, // Clear the scheduled time
          });

          console.log(
            `Successfully published scheduled post from draft ${draft._id?.toString()}: ${newPost.title}`,
          );
        } else {
          console.warn(
            `Unexpected schedule_publish_type ${draft.schedule_publish_type} for scheduled draft ${draft._id?.toString()}, skipping`,
          );
          continue;
        }

        totalProcessed++;
      } catch (error) {
        console.error(
          `Error processing scheduled draft ${draft._id?.toString()}:`,
          error,
        );
        // Update the draft status to indicate failure but keep it for retry
        await updateDraft(draft._id?.toString(), {
          moderationNotes: [
            ...(draft.moderationNotes || []),
            `Failed to process scheduled draft: ${error.message} at ${new Date().toISOString()}`,
          ],
        });
      }
    }

    return { success: true, processed: totalProcessed };
  } catch (error) {
    console.error("Error in processScheduledPosts:", error);
    return { success: false, error: error.message };
  }
};

// API endpoint to trigger scheduled post processing (for cron jobs)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  // Basic authentication - in production, use a more secure method
  if (authHeader !== `Bearer ${process.env.CRON_AUTH_TOKEN}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await processScheduledPosts();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing scheduled posts:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
