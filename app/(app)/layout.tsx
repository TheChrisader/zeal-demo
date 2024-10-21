import { ReactNode } from "react";
import Topbar from "@/components/layout/Topbar";
import AuthProvider from "@/context/auth/auth.provider";
import { getPreferencesByUserId } from "@/database/preferences/preferences.repository";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { cleanObject } from "@/utils/cleanObject.utils";
import MobileNav from "@/components/layout/MobileNav/page";

const AppLayout = async ({ children }: { children: ReactNode }) => {
  await connectToDatabase();

  const { user } = cleanObject(await validateRequest());
  const canWrite = user
    ? user.role === "admin" || user.role === "author"
    : false;
  const canAdmin = user ? user.role === "admin" : false;

  const preferences = cleanObject(await getPreferencesByUserId(user?.id));

  return (
    <AuthProvider value={{ user, canWrite, canAdmin, preferences }}>
      <Topbar />
      {user && <MobileNav />}
      {children}
      <div className="max-[750px]:mb-20"></div>
    </AuthProvider>
  );
};

export default AppLayout;
