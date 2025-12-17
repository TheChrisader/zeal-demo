"use client";

import { usePathname } from "@/i18n/routing";
import { motion } from "framer-motion";
import { FooterTop } from "./footer-top";
import { FooterColumns } from "./footer-columns";
import { FooterBottom } from "./footer-bottom";

const excludeFromPaths = ["editor"];

export function Footer() {
  const pathname = usePathname();

  if (excludeFromPaths.includes(pathname.split("/")[1] as string)) {
    return null;
  }

  return (
    <footer
      className="mt-5 w-full bg-emerald-950 text-special-text dark:bg-emerald-950/90"
      role="contentinfo"
    >
      {/* Newsletter and Brand Section */}
      <FooterTop />

      {/* Multi-column Navigation Section */}
      <div className="container mx-auto px-4">
        <FooterColumns />
      </div>

      {/* Copyright and Back to Top Section */}
      <FooterBottom />
    </footer>
  );
}
