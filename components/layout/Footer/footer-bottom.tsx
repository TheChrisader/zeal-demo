"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export function FooterBottom() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="border-t border-emerald-900 bg-emerald-950 px-4 py-6">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-sm text-emerald-200"
            >
              © {new Date().getFullYear()} Zeal News Africa. All Rights
              Reserved.
            </motion.div>

            {/* Additional Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 text-sm"
            >
              <a
                href="/rss.xml"
                className="text-emerald-200 transition-colors duration-200 hover:text-emerald-400"
              >
                RSS Feed
              </a>
              <span className="hidden text-emerald-700 md:inline">|</span>
              <Link
                href="/newsletter"
                className="text-emerald-200 transition-colors duration-200 hover:text-emerald-400"
              >
                Join Our Newsletter
              </Link>
              <span className="hidden text-emerald-700 md:inline">|</span>
              <a
                href="/sitemap.xml"
                className="text-emerald-200 transition-colors duration-200 hover:text-emerald-400"
              >
                XML Sitemap
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 right-8 z-40"
          >
            <Button
              onClick={scrollToTop}
              size="icon"
              className="rounded-full bg-emerald-700 shadow-lg hover:bg-emerald-600"
              aria-label="Back to top"
            >
              <ChevronUp className="size-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
