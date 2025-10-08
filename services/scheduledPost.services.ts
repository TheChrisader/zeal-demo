import { fetcher } from "@/lib/fetcher";

import { IPost } from "@/types/post.type";
import { jsonToFormData } from "@/utils/converter.utils";
import { IDraft } from "@/types/draft.type";

interface SchedulePostParams {
  draftId: string;
  scheduled_at: string; // ISO date string
}

export const schedulePostForFreelancer = async (
  params: SchedulePostParams,
): Promise<any> => {
  try {
    const response = await fetcher("/api/v1/schedule-post-freelancer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    return response;
  } catch (error) {
    throw error;
  }
};

export const schedulePostForWriter = async (
  params: SchedulePostParams,
): Promise<any> => {
  try {
    const response = await fetcher("/api/v1/schedule-post-writer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    return response;
  } catch (error) {
    throw error;
  }
};

// Helper function to determine which API to call based on user role
export const schedulePost = async (
  params: SchedulePostParams,
  userRole?: string,
): Promise<any> => {
  if (userRole === "freelance_writer") {
    return schedulePostForFreelancer(params);
  } else {
    return schedulePostForWriter(params);
  }
};

export const updateScheduledPostForFreelancer = async (
  draftId: string,
  params: { scheduled_at: string },
): Promise<any> => {
  try {
    const response = await fetcher("/api/v1/schedule-post-freelancer", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ draftId, ...params }),
    });

    return response;
  } catch (error) {
    throw error;
  }
};

export const updateScheduledPostForWriter = async (
  draftId: string,
  params: { scheduled_at: string },
): Promise<any> => {
  try {
    const response = await fetcher("/api/v1/schedule-post-writer", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ draftId, ...params }),
    });

    return response;
  } catch (error) {
    throw error;
  }
};

export const updateScheduledPost = async (
  draftId: string,
  params: { scheduled_at: string },
  userRole?: string,
): Promise<any> => {
  if (userRole === "freelance_writer") {
    return updateScheduledPostForFreelancer(draftId, params);
  } else {
    return updateScheduledPostForWriter(draftId, params);
  }
};

export const cancelScheduledPostForFreelancer = async (
  draftId: string,
): Promise<any> => {
  try {
    const response = await fetcher("/api/v1/schedule-post-freelancer", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ draftId }),
    });

    return response;
  } catch (error) {
    throw error;
  }
};

export const cancelScheduledPostForWriter = async (
  draftId: string,
): Promise<any> => {
  try {
    const response = await fetcher("/api/v1/schedule-post-writer", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ draftId }),
    });

    return response;
  } catch (error) {
    throw error;
  }
};

export const cancelScheduledPost = async (
  draftId: string,
  userRole?: string,
): Promise<any> => {
  if (userRole === "freelance_writer") {
    return cancelScheduledPostForFreelancer(draftId);
  } else {
    return cancelScheduledPostForWriter(draftId);
  }
};
