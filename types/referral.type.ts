import { Id } from "@/lib/database";
import { IUser } from "@/types/user.type";

export interface IReferral {
  id: Id | string;
  user_id: Id | string;
  referrer_id: Id | string;
  referral_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface IReferralAnalytics {
  total_referrals: number;
  recent_referrals: IReferralUser[];
  referral_link: string;
  referral_code: string;
}

export interface IReferralUser {
  id: Id | string;
  display_name: string;
  username: string;
  avatar: string | null;
  created_at: Date;
}

export interface IReferralStats {
  referral_count: number;
  referral_code: string | null;
  referred_users: IReferralUser[];
}
