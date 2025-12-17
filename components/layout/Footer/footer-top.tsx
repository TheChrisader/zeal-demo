"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FooterNewsletterSignup } from "./newsletter-signup";
import { SocialLinks } from "./social-links";

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

export function FooterTop() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already selected newsletter preferences
    const preferencesSelected = getCookie("zealnews_preferences_selected");
    setIsSubscribed(preferencesSelected === "true");
    setIsLoading(false);
  }, []);

  // Don't render anything while loading or if user is already subscribed
  if (isLoading || isSubscribed) {
    return null;
  }
  return (
    <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 w-full lg:w-auto"
          >
            <FooterNewsletterSignup />
          </motion.div>

          {/* Brand & Social Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center lg:items-end gap-4"
          >
            <div className="text-center lg:text-right">
              <h2 className="text-3xl font-bold text-white mb-2">
                Zeal News Africa
              </h2>
              <p className="text-emerald-100">
                Your trusted source for African news
              </p>
            </div>
            <SocialLinks />
          </motion.div>
        </div>
      </div>
    </div>
  );
}