"use client";
import { usePathname } from "@/i18n/routing";
import { Copyright } from "./copyright";
import { NavigationLinks } from "./navigation-links";
import { SocialLinks } from "./social-links";

const excludeFromPaths = ["editor"];

export function Footer() {
  const pathname = usePathname();
  if (excludeFromPaths.includes(pathname.split("/")[1] as string)) {
    return null;
  }

  return (
    <footer className="mt-5 w-full bg-emerald-950 text-special-text dark:bg-emerald-950/90">
      <div className="container mx-auto space-y-8 px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-[#fff]">Zeal News Africa</div>
          <SocialLinks />
        </div>
        <NavigationLinks />
        <Copyright />
      </div>
    </footer>
  );
}
