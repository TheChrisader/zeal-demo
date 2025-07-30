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
import { Footer } from "@/components/layout/Footer";
import { StickyNewsletterBanner } from "@/components/layout/NewsletterForm/StickyNewsletterBanner";
import { checkUserWriterStatus } from "@/utils/user.utils";
// import AppLayoutClientComponents from "./_components/AppLayoutClientComponents";
// import FloatingWrite from "./_components/FloatingWrite";

// const MobileNav = dynamic(() => import("@/components/layout/MobileNav/page"), {
//   ssr: false,
// });

// const FloatingWrite = dynamic(() => import("./_components/FloatingWrite"), {
//   ssr: false,
// });

const AppLayoutClientComponents = dynamic(
  () => import("./_components/AppLayoutClientComponents"),
  { ssr: false },
);

const AppLayout = async ({
  children,
  hideTopbar = false,
  hideFooter = false,
}: {
  children: ReactNode;
  hideTopbar?: boolean;
  hideFooter?: boolean;
}) => {
  await connectToDatabase();

  // const { user } = cleanObject(await validateRequest());
  // const canWrite = checkUserWriterStatus(user);
  // const canAdmin = user ? user.role === "admin" : false;

  // const preferences = cleanObject(await getPreferencesByUserId(user?.id));

  return (
    // <AuthProvider value={{ user, canWrite, canAdmin, preferences }}>
    <NotificationProvider>
      {!hideTopbar && <Topbar />}
      {/* <MobileNav /> */}
      {children}
      {/* <StickyNewsletterBanner /> */}
      {/* <FloatingWrite /> */}
      <AppLayoutClientComponents />
      {!hideFooter && <Footer />}
      {/* <div className="max-[750px]:mb-20"></div> */}
    </NotificationProvider>
    // </AuthProvider>
  );
};

// mobilenav, flotw, div

export default AppLayout;
