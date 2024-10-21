"use client";
import { ReactNode } from "react";
import AuthContext, { AuthContextValue } from ".";

const AuthProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: AuthContextValue;
}) => {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
