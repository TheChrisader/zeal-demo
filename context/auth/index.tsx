"use client";
import { IPreferences } from "@/types/preferences.type";
import { User } from "lucia";
import { createContext } from "react";

export type Permission = "Write" | "Admin";

export type AuthContextValue = {
  user: User | null;
  // can: (action: Permission) => boolean;
  canWrite: boolean;
  canAdmin: boolean;
  preferences: IPreferences | null;
  // loading: LoadingState;
  // error: string | null;
  // status: "authenticated" | "loading" | "unauthenticated";
};

const AuthContext = createContext<AuthContextValue | null>(null);
export default AuthContext;
