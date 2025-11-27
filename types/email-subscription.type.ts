import { Document, Types } from "mongoose";

export const EmailSubscriptionStatuses = [
  "subscribed",
  "unsubscribed",
] as const;
export type EmailSubscriptionStatus =
  (typeof EmailSubscriptionStatuses)[number];

export interface IEmailSubscription extends Document<Types.ObjectId> {
  subscriber_id: Types.ObjectId;
  list_id: string;
  status: EmailSubscriptionStatus;
  subscribed_at: Date;
  unsubscribed_at?: Date;
  created_at: Date;
  updated_at: Date;
}
