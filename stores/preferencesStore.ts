import { toast } from "sonner";
import { create } from "zustand";
import { IPreferences } from "@/types/preferences.type";

interface PreferencesState {
  preferences: IPreferences | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<IPreferences | null>;
  setPreferences: (preferences: IPreferences | null) => void;
  updatePreference: <K extends keyof IPreferences>(
    key: K,
    value: IPreferences[K],
  ) => void;
  clear: () => void;
}

let preferencesInitPromise: Promise<IPreferences | null> | null = null;

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  preferences: null,
  loading: false,
  initialized: false,

  initialize: async (): Promise<IPreferences | null> => {
    if (preferencesInitPromise) {
      return preferencesInitPromise;
    }

    const currentState = get();
    if (currentState.initialized) {
      return Promise.resolve(currentState.preferences);
    }

    set({ loading: true });

    preferencesInitPromise = (async (): Promise<IPreferences | null> => {
      try {
        const response = await fetch("/api/v1/preferences", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            set({ preferences: null, loading: false, initialized: true });
            return null;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const preferencesData: IPreferences = await response.json();
        set({
          preferences: preferencesData,
          loading: false,
          initialized: true,
        });
        return preferencesData;
      } catch (error) {
        console.error("Preferences initialization failed:", error);
        toast.error("Failed to fetch preferences. Please try again.");
        set({ preferences: null, loading: false, initialized: true });
        return null;
      } finally {
        preferencesInitPromise = null;
      }
    })();

    return preferencesInitPromise;
  },

  setPreferences: (preferences: IPreferences | null) => {
    set({ preferences, loading: false, initialized: true });
  },

  updatePreference: <K extends keyof IPreferences>(
    key: K,
    value: IPreferences[K],
  ) => {
    const currentPreferences = get().preferences;
    if (currentPreferences) {
      set({
        preferences: {
          ...currentPreferences,
          [key]: value,
        },
      });
    }
  },

  clear: () => {
    set({ preferences: null, loading: false, initialized: false });
    preferencesInitPromise = null;
  },
}));
