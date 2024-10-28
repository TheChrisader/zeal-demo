import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Poppins } from "next/font/google";
import "./globals.css";
// import PageProgressBar from "@/components/layout/PageProgressBar";
import { ThemeProvider } from "@/components/providers/theme-provider";
// import CookieConsentComponent from "@/components/layout/Cookie/CookieConsent";
// import { Toaster } from "@/components/ui/sonner";

const PageProgressBar = dynamic(
  () => import("@/components/layout/PageProgressBar"),
  { ssr: false },
);

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((mod) => mod.Toaster),
  { ssr: false },
);

const CookieConsentComponent = dynamic(
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.className}`}>
        <ThemeProvider defaultTheme="system" attribute="class" enableSystem>
          <PageProgressBar />
          {children}
          <Toaster position="top-center" />
          <CookieConsentComponent />
        </ThemeProvider>
      </body>
    </html>
  );
}
