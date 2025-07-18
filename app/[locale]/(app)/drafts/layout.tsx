import { ReactNode } from "react";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { WRITER_WHITELIST } from "@/constants/roles";

export default async function DraftsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connectToDatabase();
  await serverAuthGuard({
    rolesWhiteList: WRITER_WHITELIST,
    redirect: true,
  });

  return <>{children}</>;
}
