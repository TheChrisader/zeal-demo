import { Id } from "@/lib/database";
import { NotificationNewsTypes } from "./notification.type";

export const ProfileVisibility = ["public", "private"] as const;
export const LastSeen = ["friends", "anyone"] as const;

export type NotificationSettings = Record<
  keyof typeof NotificationNewsTypes,
  boolean
>;

export type PrivacySettings = {
  profile_visibility: (typeof ProfileVisibility)[number];
  last_seen: (typeof LastSeen)[number];
};

export type NotificationPreferences = {
  push_notification: boolean;
  email_notification: boolean;
  in_app_notification: boolean;
};

export interface IPreferences {
  id: Id | string;
  user_id: Id | string;
  language: string;
  category_updates: string[];
  notification_settings: NotificationSettings;
  notification_preferences: NotificationPreferences;
  privacy_settings: PrivacySettings;
  created_at: Date;
  updated_at: Date;
}
