"use client";
import { useEffect } from "react";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { IPreferences } from "@/types/preferences.type";
import { useAuth } from "./useAuth";

interface UsePreferencesReturn {
  preferences: IPreferences | null;
  loading: boolean;
  initialized: boolean;
  updatePreference: <K extends keyof IPreferences>(
    key: K,
    value: IPreferences[K],
  ) => void;
  refetch: () => Promise<IPreferences | null>;
}

export function usePreferences(): UsePreferencesReturn {
  const { isAuthenticated } = useAuth();

  const preferences = usePreferencesStore((state) => state.preferences);
  const loading = usePreferencesStore((state) => state.loading);
  const initialized = usePreferencesStore((state) => state.initialized);
  const initialize = usePreferencesStore((state) => state.initialize);
  const updatePreference = usePreferencesStore(
    (state) => state.updatePreference,
  );

  useEffect(() => {
    if (isAuthenticated && !initialized && !loading) {
      initialize().catch((error) => {
        console.error("Failed to initialize preferences:", error);
      });
    }
  }, [isAuthenticated, initialized, loading, initialize]);

  useEffect(() => {
    if (!isAuthenticated && initialized) {
      usePreferencesStore.getState().clear();
    }
  }, [isAuthenticated, initialized]);

  return {
    preferences,
    loading,
    initialized,
    updatePreference,
    refetch: initialize,
  };
}
