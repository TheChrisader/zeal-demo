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

// Admin-specific interfaces
export interface IAdminReferralSummary {
  total_referrals: number;
  total_referrers: number;
  average_referrals_per_referrer: number;
  daily_referrals: Array<{
    date: string;
    count: number;
  }>;
  weekly_referrals: Array<{
    week: string;
    count: number;
  }>;
}

export interface IReferralLeaderboardEntry {
  user_id: string;
  display_name: string;
  username: string;
  avatar: string | null;
  referral_count: number;
  recent_referrals: number;
  rank: number;
  created_at: Date;
}

export interface IAdminReferralUserAnalytics {
  user: {
    id: string;
    display_name: string;
    username: string;
    avatar: string | null;
    email: string;
    referral_code: string;
    created_at: Date;
  };
  referral_stats: {
    total_referrals: number;
    referral_conversion_rate: number;
    recent_referrals: IReferralUser[];
  };
  monthly_referrals: Array<{
    month: string;
    count: number;
  }>;
}
