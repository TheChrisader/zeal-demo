"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/useAuth";

const MobileNav = dynamic(() => import("@/components/layout/MobileNav/page"), {
  ssr: false,
});

const FloatingWrite = dynamic(() => import("./FloatingWrite"), {
  ssr: false,
});

const StickyNewsletterBanner = dynamic(
  () =>
    import("@/components/layout/NewsletterForm/StickyNewsletterBanner").then(
      (mod) => mod.StickyNewsletterBanner,
    ),
  { ssr: false },
);

const ReferralReminderPopup = dynamic(
  () => import("@/components/promotion/ReferralReminderPopup"),
  { ssr: false },
);

const AppLayoutClientComponents = () => {
  const { user } = useAuth();

  return (
    <>
      {user && <MobileNav />}
      {user && <FloatingWrite />}
      <StickyNewsletterBanner />
      <ReferralReminderPopup />
    </>
  );
};

export default AppLayoutClientComponents;
