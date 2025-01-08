import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Poppins } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Suspense } from "react";

const PageProgressBar = dynamic(
  () => import("@/components/layout/PageProgressBar"),
  { ssr: false },
);

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((mod) => mod.Toaster),
  { ssr: false },
);

const CookieConsent = dynamic(
  () => import("@/components/layout/Cookie/CookieConsent"),
  { ssr: false },
);

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Zeal News Africa",
  description: "Sharing Africa's story around the world.",
  category: "website",
  generator: "Next.js",
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  width: "device-width",
  themeColor: "#2f7930",
};

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  if (!routing.locales.includes(locale as "en" | "fr")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${poppins.className}`}>
        {/* <Suspense> */}
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider defaultTheme="system" attribute="class" enableSystem>
            <PageProgressBar />
            {children}
            <Toaster position="top-center" />
            <CookieConsent />
          </ThemeProvider>
        </NextIntlClientProvider>
        {/* </Suspense> */}
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID as string} />
    </html>
  );
}
