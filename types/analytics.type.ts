import { Document } from "mongodb";

export interface IAnalytics extends Document {
  userId: string;
  postId: string;
  category: string;
  readAt: Date;
  timeSpent: number;
  readComplete: boolean;
  scrollDepth: number;
  lastPosition: number;
  bookmarked: boolean;
  interactions: {
    likeClicked: boolean;
    shareClicked: boolean;
    commentsMade: number;
    highlightCount: number;
  };
  readingSpeed: number;
  timeOfDay: string;
  deviceType: string;
  readingSession: string;
}
