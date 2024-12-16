import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { redirect } from "@/i18n/routing";
import { ReactNode } from "react";

const OnboardingLayout = async ({ children }: { children: ReactNode }) => {
  await connectToDatabase();
  const { user } = await validateRequest();

  if (!user?.has_email_verified) {
    redirect({
      href: "/",
      locale: "en",
    });
  }

  return <>{children}</>;
};

export default OnboardingLayout;
