"use client";

import Script from "next/script";
import { useRouter } from "@/app/_components/useRouter";
import { usePathname } from "@/i18n/routing";
import revalidatePathAction from "@/app/actions/revalidatePath";
// import useAuth from "@/context/auth/useAuth";
import { SignUserWithoutPassword } from "@/services/auth.services";
import { decodeJWTResponse } from "@/utils/jwt.utils";

const OneTap = () => {
  const router = useRouter();
  const pathname = usePathname();
  // const { user } = useAuth();

  // if (user) return null;

  return (
    <Script
      async
      strategy="lazyOnload"
      src="https://accounts.google.com/gsi/client"
      onLoad={() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: async (data: { credential: string; select_by: string }) => {
            const user = decodeJWTResponse(data.credential);
            const res = await SignUserWithoutPassword({
              email: user.email,
              display_name: user.name,
              username: user.email.split("@")[0],
              has_email_verified: true,
              has_password: false,
              avatar: user.picture,
            });

            revalidatePathAction("/");

            if (res.message === "Created") {
              router.push("/onboarding");
            } else {
              if (pathname !== "/") router.push("/");
            }
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).google.accounts.id.prompt();
      }}
    />
  );
};

export default OneTap;
