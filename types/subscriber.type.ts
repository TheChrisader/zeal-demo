import { Document, Types } from "mongoose";

export const SubscriberStatuses = [
  "active",
  "unsubscribed",
  "bounced",
  "complaint",
] as const;
export type SubscriberStatus = (typeof SubscriberStatuses)[number];

export interface ISubscriber extends Document<Types.ObjectId> {
  email_address: string;
  name?: string;
  global_status: SubscriberStatus;
  status_reason?: string;
  status_updated_at: Date;
  is_verified: boolean;
  verification_token?: string;
  verified_at?: Date;
  soft_bounce_count: number;
  last_soft_bounce_at?: Date;
  created_at: Date;
  updated_at: Date;
}
