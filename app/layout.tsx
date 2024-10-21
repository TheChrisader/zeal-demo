import type { Metadata, Viewport } from "next";
import { Inter, Noto_Serif } from "next/font/google";
import "./globals.css";
import PageProgressBar from "@/components/layout/PageProgressBar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });
const notoSerif = Noto_Serif({ subsets: ["latin"] });

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${notoSerif.className}`}>
        <ThemeProvider defaultTheme="system" attribute="class" enableSystem>
          <PageProgressBar />
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
