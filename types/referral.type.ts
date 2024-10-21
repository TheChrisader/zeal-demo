import { Id } from "@/lib/database";

export interface IReferral {
  id: Id | string;
  user_id: Id | string;
  referrer_id: Id | string;
  referral_count: number;
  created_at: Date;
  updated_at: Date;
}
