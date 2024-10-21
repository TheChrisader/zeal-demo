import { ReactNode } from "react";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import ActionHandlerProvider from "./_context/action-handler/action-handler.provider";

export default async function WriteLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connectToDatabase();
  await serverAuthGuard({
    rolesWhiteList: ["user"],
    redirect: true,
  });

  return <ActionHandlerProvider>{children}</ActionHandlerProvider>;
}
