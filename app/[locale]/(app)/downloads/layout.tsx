import { ReactNode } from "react";
import DownloadsProvider from "@/context/downloads/downloads.provider";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";

export default async function DownloadsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connectToDatabase();
  await serverAuthGuard({
    rolesWhiteList: ["user", "writer", "admin"],
    redirect: true,
  });

  return <DownloadsProvider>{children}</DownloadsProvider>;
}
