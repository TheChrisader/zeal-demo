import { ReactNode } from "react";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";

export default async function BookmarksLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connectToDatabase();
  await serverAuthGuard({
    rolesWhiteList: ["user", "writer:pending", "writer", "admin"],
    redirect: true,
  });

  return <>{children}</>;
}
