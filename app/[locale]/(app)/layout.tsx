import dynamic from "next/dynamic";
import { ReactNode } from "react";
// import MobileNav from "@/components/layout/MobileNav/page";
import Topbar from "@/components/layout/Topbar";
import AuthProvider from "@/context/auth/auth.provider";
import { getPreferencesByUserId } from "@/database/preferences/preferences.repository";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { cleanObject } from "@/utils/cleanObject.utils";
import { NotificationProvider } from "@/context/notifications/NotificationsProvider";
// import FloatingWrite from "./_components/FloatingWrite";

const MobileNav = dynamic(() => import("@/components/layout/MobileNav/page"), {
  ssr: false,
});

const FloatingWrite = dynamic(() => import("./_components/FloatingWrite"), {
  ssr: false,
});

const AppLayout = async ({ children }: { children: ReactNode }) => {
  await connectToDatabase();

  const { user } = cleanObject(await validateRequest());
  const canWrite = user
    ? user.role === "admin" || user.role === "writer"
    : false;
  const canAdmin = user ? user.role === "admin" : false;

  const preferences = cleanObject(await getPreferencesByUserId(user?.id));

  return (
    <AuthProvider value={{ user, canWrite, canAdmin, preferences }}>
      <NotificationProvider>
        <Topbar />
        {user && <MobileNav />}
        {children}
        {user && <FloatingWrite />}
        {user && <div className="max-[750px]:mb-20"></div>}
      </NotificationProvider>
    </AuthProvider>
  );
};

export default AppLayout;
