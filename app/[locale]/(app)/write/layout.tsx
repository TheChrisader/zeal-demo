import { ReactNode } from "react";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import ActionHandlerProvider from "./_context/action-handler/action-handler.provider";
import { redirect } from "@/i18n/routing";

export default async function WriteLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connectToDatabase();
  redirect({
    href: "/editor",
    locale: "en",
  });
  // await serverAuthGuard({
  //   rolesWhiteList: ["writer", "admin"],
  //   redirect: true,
  // });

  return <ActionHandlerProvider>{children}</ActionHandlerProvider>;
}
