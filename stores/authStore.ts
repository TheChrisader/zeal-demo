import { User } from "lucia";
import { toast } from "sonner";
import { create } from "zustand";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<User | null>;
  refresh: () => Promise<User | null>;
  setUser: (user: User | null) => void;
  logout: () => void;
}

let initPromise: Promise<User | null> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  initialize: async (): Promise<User | null> => {
    if (initPromise) {
      return initPromise;
    }

    const currentState = get();
    if (currentState.initialized) {
      return Promise.resolve(currentState.user);
    }

    initPromise = (async (): Promise<User | null> => {
      try {
        const response = await fetch("/api/v1/auth/account", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // Handle 401, 403, etc. as "no user"
          if (response.status === 401 || response.status === 403) {
            set({ user: null, loading: false, initialized: true });
            return null;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userData: User = await response.json();
        set({ user: userData, loading: false, initialized: true });
        return userData;
      } catch (error) {
        console.log(error);
        toast.error("Login failed. Please try again.");
        set({ user: null, loading: false, initialized: true });
        return null;
      } finally {
        initPromise = null;
      }
    })();

    return initPromise;
  },

  setUser: (user: User | null) => {
    set({ user, loading: false, initialized: true });
  },

  refresh: async (): Promise<User | null> => {
    try {
      set({ loading: true });

      const response = await fetch("/api/v1/auth/account", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          set({ user: null, loading: false, initialized: true });
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userData: User = await response.json();
      set({ user: userData, loading: false, initialized: true });
      return userData;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      toast.error("Failed to refresh user data. Please try again.");
      const currentState = get();
      set({ loading: false });
      return currentState.user;
    }
  },

  logout: () => {
    set({ user: null, loading: false, initialized: true });
    initPromise = null;
  },
}));
