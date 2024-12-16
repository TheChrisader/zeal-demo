import { fetcher } from "@/lib/fetcher";

export const updateReadingProgress = (metrics: {
  userId: string;
  postId: string;
  timeSpent: number;
  scrollDepth: number;
  readComplete: boolean;
  lastPosition: number;
  readingSpeed: number;
  timeOfDay: string;
  deviceType: string;
  readingSession: string;
  interactions: unknown;
}) => {
  try {
    fetcher(`/api/v1/analytics`, {
      method: "POST",
      body: JSON.stringify(metrics),
    });
  } catch (error) {
    console.error(error);
  }
};
