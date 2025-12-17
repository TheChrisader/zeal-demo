"use client";

import { motion } from "framer-motion";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { Twitter } from "lucide-react";
import Link from "next/link";
import { FaTiktok } from "react-icons/fa";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/14SxxXDRa9",
    icon: Facebook,
  },
  {
    name: "Twitter",
    href: "https://x.com/zealnewsafrica",
    icon: Twitter,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/zealnewsafrica/",
    icon: Instagram,
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@zeal.news.africa",
    icon: FaTiktok,
  },
];

export function SocialLinks() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {socialLinks.map((link, index) => {
        const Icon = link.icon;
        return (
          <motion.div
            key={link.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={link.href}
              className="group relative flex size-10 items-center justify-center rounded-full bg-emerald-900/50 text-emerald-200 transition-all duration-300 hover:bg-emerald-800 hover:text-white hover:shadow-lg"
              aria-label={link.name}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon className="size-5" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-emerald-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {link.name}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
