import { ReactNode } from "react";
import DownloadsProvider from "@/context/downloads/downloads.provider";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { DEFAULT_WHITELIST } from "@/constants/roles";

export default async function DownloadsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connectToDatabase();
  await serverAuthGuard({
    rolesWhiteList: DEFAULT_WHITELIST,
    redirect: true,
  });

  return <DownloadsProvider>{children}</DownloadsProvider>;
}
