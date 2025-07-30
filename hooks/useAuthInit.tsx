"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

export function useAuthInit(): void {
  const initialize = useAuthStore((state) => state.initialize);
  const initialized = useAuthStore((state) => state.initialized);

  useEffect(() => {
    if (!initialized) {
      initialize().catch((error) => {
        console.error("Failed to initialize auth:", error);
        toast.error("Login failed. Please try again.");
      });
    }
  }, [initialize, initialized]);
}
