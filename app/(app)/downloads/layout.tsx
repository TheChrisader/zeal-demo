import { ReactNode } from "react";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import DownloadsProvider from "@/context/downloads/downloads.provider";

export default async function DownloadsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connectToDatabase();
  await serverAuthGuard({
    rolesWhiteList: ["user", "writer:pending", "writer", "admin"],
    redirect: true,
  });

  return <DownloadsProvider>{children}</DownloadsProvider>;
}
