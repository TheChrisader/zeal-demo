import { Id } from "@/lib/database";

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
  influencer_referrals: number;
  regular_referrals: number;
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
    referral_code: string | null;
    created_at: Date;
  };
  referral_stats: {
    total_referrals: number;
    referral_conversion_rate: number;
    recent_referrals: IReferralUser[];
  };
  daily_referrals: Array<{
    date: string;
    count: number;
  }>;
}

// Influencer-specific interfaces
export type InfluencerStatus = "active" | "inactive" | "pending" | "suspended";

export interface IInfluencer {
  id: string;
  user_id: string;
  status: InfluencerStatus;
  notes: string | null;
  joined_at: Date;
  created_at: Date;
}

export interface IInfluencerAnalytics {
  total_influencers: number;
  active_influencers: number;
  total_influencer_referrals: number;
  influencers: Array<{
    user_id: string;
    display_name: string;
    username: string;
    referral_count: number;
    status: InfluencerStatus;
    joined_at: Date;
  }>;
}
