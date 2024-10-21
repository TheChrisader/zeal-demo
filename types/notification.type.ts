import { Id } from "@/lib/database";

export const NotificationReactionTypes = {
  COMMENT: "comment",
  FOLLOW: "follow",
  LIKE: "like",
  REPLY: "reply",
  REACTION: "reaction",
} as const;

export const NotificationNewsTypes = {
  BREAKING: "breaking",
  TOP: "top",
  CATEGORY: "category",
};

type NotificationTypes =
  | keyof typeof NotificationReactionTypes
  | keyof typeof NotificationNewsTypes;

export interface INotification {
  id: Id | string;
  user_id: Id | string;
  article_id: Id | string;
  type: NotificationTypes;
  content: string;
  read: boolean;
  created_at: Date;
  updated_at: Date;
}
