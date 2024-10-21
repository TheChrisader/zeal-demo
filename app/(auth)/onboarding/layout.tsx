import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const OnboardingLayout = async ({ children }: { children: ReactNode }) => {
  await connectToDatabase();
  const { user } = await validateRequest();

  if (!user?.has_email_verified) {
    redirect("/");
  }

  return <>{children}</>;
};

export default OnboardingLayout;
