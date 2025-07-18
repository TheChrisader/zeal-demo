import { ReactNode } from "react";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { DEFAULT_WHITELIST } from "@/constants/roles";

export default async function BookmarksLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connectToDatabase();
  await serverAuthGuard({
    rolesWhiteList: DEFAULT_WHITELIST,
    redirect: true,
  });

  return <>{children}</>;
}
