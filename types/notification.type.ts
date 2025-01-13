import { Id } from "@/lib/database";

type NotificationType =
  | "INTERACTION"
  | "RECOMMENDATION"
  | "SYSTEM"
  | "ACHIEVEMENT"
  | "REMINDER"
  | "MENTION";

type NotificationSubtype =
  // Interaction subtypes
  | "POST_LIKE"
  | "POST_COMMENT"
  | "COMMENT_REPLY"
  | "NEW_FOLLOWER"
  | "SHARED_POST"

  // Recommendation subtypes
  | "TRENDING_CONTENT"
  | "USER_SUGGESTED"
  | "TOP_PICKS"

  // System subtypes
  | "ACCOUNT_UPDATE"
  | "SECURITY_ALERT"
  | "PAYMENT_STATUS"

  // Achievement subtypes
  | "BADGE_EARNED"
  | "MILESTONE_REACHED"

  // Reminder subtypes
  | "SCHEDULED_REMINDER"
  | "CUSTOM_REMINDER"

  // Mention subtypes
  | "COMMENT_MENTION"
  | "POST_MENTION";

type TargetObjectModel = "Post" | "Comment" | "User" | "Achievement" | "System";

type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

interface NotificationStatus {
  isRead: boolean;
  isArchived: boolean;
  readAt?: Date;
  archivedAt?: Date;
}

export interface NotificationContent {
  title?: string;
  body?: string;
  thumbnail?: string;
  url?: string;
}

interface TargetObject {
  model: TargetObjectModel;
  id: Id;
  slug?: string;
}

export const NotificationNewsTypes = {
  TRENDING_CONTENT: "trending_content",
  TOP_PICKS: "top_picks",
  // USER_SUGGESTED: "user_suggested",
};

export interface INotification {
  _id?: Id;
  recipient: Id;
  type: NotificationType;
  subtype: NotificationSubtype;
  actors: Id[];
  targetObject: TargetObject;
  // metadata: Map<string, any>;
  content: NotificationContent;
  status: NotificationStatus;
  priority: NotificationPriority;
  // expiresAt?: Date;
  created_at: Date;
  updated_at: Date;

  markAsRead(): Promise<INotification>;
  archive(): Promise<INotification>;
}

export type Notification = Omit<INotification, "markAsRead" | "archive">;
