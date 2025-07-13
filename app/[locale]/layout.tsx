import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Suspense } from "react";
import ClearPushNotifications from "./(app)/_components/ClearPushNotifications";
import GoogleAdsense from "./(app)/_components/GoogleAdsense";
import { Footer } from "@/components/layout/Footer";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

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

const cnnSansDisplay = localFont({
  src: [
    {
      path: "../fonts/CNNSansDisplay-Regular.ttf",
      weight: "400",
      // style: "normal",
    },
    {
      path: "../fonts/CNNSansDisplay-Medium.ttf",
      weight: "500",
      // style: "normal",
    },
    {
      path: "../fonts/CNNSansDisplay-Bold.ttf",
      weight: "600",
      // style: "normal",
    },
    {
      path: "../fonts/CNNSansDisplay-Heavy.ttf",
      weight: "700",
      // style: "normal",
    },
    {
      path: "../fonts/CNNSansDisplay-Black.ttf",
      weight: "800",
      // style: "normal",
    },
  ],
  variable: "--font-cnn-sans-display",
});

export const metadata: Metadata = {
  title: "Zeal News Africa",
  description:
    "Get the latest African news headlines, in-depth analysis, and breaking stories from across the continent. Zeal News Africa covers politics, business, tech, culture, sports, and more, connecting Africa and the diaspora with unfiltered, authentic reporting.",
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
      <body className={`${cnnSansDisplay.className}`}>
        {/* <Suspense> */}
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider defaultTheme="system" attribute="class" enableSystem>
            <PageProgressBar />
            <ReactQueryProvider>
              <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
            </ReactQueryProvider>
            <Toaster position="top-center" />
            <CookieConsent />
          </ThemeProvider>
          {/* <Footer /> */}
        </NextIntlClientProvider>
        {/* </Suspense> */}
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID as string} />
      <GoogleAdsense
        pId={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_KEY as string}
      />
      <ClearPushNotifications />
    </html>
  );
}
