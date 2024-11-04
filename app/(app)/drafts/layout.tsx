import { ReactNode } from "react";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";

export default async function DraftsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connectToDatabase();
  await serverAuthGuard({
    rolesWhiteList: ["writer", "admin"],
    redirect: true,
  });

  return <>{children}</>;
}
