"use client";
import { User } from "lucia";
import { useAuthStore } from "@/stores/authStore";
import { checkUserWriterStatus } from "@/utils/user.utils";
import { useAuthInit } from "./useAuthInit";

interface UseAuthReturn {
  user: User | null;
  canWrite: boolean;
  canAdmin: boolean;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refresh: () => Promise<User | null>;
  hasReferralCode: boolean;
  referralCode: string | null;
  referralCount: number;
}

export function useAuth(): UseAuthReturn {
  useAuthInit();

  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const initialized = useAuthStore((state) => state.initialized);
  const logout = useAuthStore((state) => state.logout);
  const refresh = useAuthStore((state) => state.refresh);

  const canWrite = checkUserWriterStatus(user);
  const canAdmin = user ? user.role === "admin" : false;
  const hasReferralCode = !!user?.referral_code;
  const referralCode = user?.referral_code || null;
  const referralCount = user?.referral_count || 0;

  return {
    user,
    canWrite,
    canAdmin,
    loading,
    initialized,
    isAuthenticated: !!user,
    logout,
    refresh,
    hasReferralCode,
    referralCode,
    referralCount,
  };
}
