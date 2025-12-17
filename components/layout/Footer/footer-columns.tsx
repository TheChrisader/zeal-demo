"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { SocialLinks } from "./social-links";

// Using the EXISTING working links from the original footer
const primaryLinks = [
  { href: "/watch", label: "Watch" },
  // { href: "#", label: "Listen" },
  // { href: "#", label: "Live TV" },
];

const secondaryLinks = [
  { href: "/info/about-us", label: "About Us" },
  { href: "/info/terms-and-conditions", label: "Terms of Use" },
  { href: "/info/privacy-policy", label: "Privacy Policy" },
  { href: "/info/cookie-policy", label: "Cookie Policy" },
  { href: "/info/advertise-with-us", label: "Advertise With Us" },
];

// Additional useful links to enhance the footer
const additionalLinks = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/technology", label: "Technology" },
  { href: "/discovery", label: "Discovery" },
];

interface FooterLinkColumnProps {
  title: string;
  links: Array<{ label: string; href: string }>;
  className?: string;
}

function FooterLinkColumn({ title, links, className }: FooterLinkColumnProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-emerald-100 transition-colors duration-200 hover:text-emerald-400"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface MobileFooterLinkColumnProps {
  title: string;
  links: Array<{ label: string; href: string }>;
  value: string;
}

function MobileFooterLinkColumn({
  title,
  links,
  value,
}: MobileFooterLinkColumnProps) {
  return (
    <AccordionItem value={value} className="border-emerald-900">
      <AccordionTrigger className="text-left text-white hover:no-underline">
        {title}
      </AccordionTrigger>
      <AccordionContent>
        <ul className="space-y-2 pt-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block py-1 text-sm text-emerald-100 transition-colors duration-200 hover:text-emerald-400"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}

export function FooterColumns() {
  return (
    <>
      {/* Desktop Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden gap-8 border-t border-emerald-900 bg-emerald-950 py-12 lg:grid lg:grid-cols-5"
        style={{
          gridTemplateColumns: '1.5fr 0.8fr 0.8fr 0.8fr 1fr'
        }}
      >
        {/* About Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">About Zeal News</h3>
          <p className="text-sm leading-relaxed text-emerald-100">
            Your trusted source for accurate, timely news across Africa and the
            world. Delivering quality journalism with integrity since our
            inception.
          </p>
          <Link
            href="/info/about-us"
            className="inline-flex items-center text-sm font-medium text-emerald-400 transition-colors duration-200 hover:text-emerald-300"
          >
            Learn more about us
          </Link>
        </div>

        {/* Quick Links Column - combining existing primary and some additional links */}
        <FooterLinkColumn
          title="Quick Links"
          links={[...primaryLinks, ...additionalLinks]}
        />

        {/* Company Column - using the existing working links */}
        <FooterLinkColumn
          title="Company"
          links={[
            secondaryLinks[0],
            { label: "Contact Us", href: "/info/contact-us" },
            secondaryLinks[4],
          ]}
        />

        {/* Legal Column - using the existing working links */}
        <FooterLinkColumn
          title="Legal"
          links={[secondaryLinks[1], secondaryLinks[2], secondaryLinks[3]]}
        />

        {/* Connect Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Connect</h3>
          <p className="text-sm text-emerald-100">
            Follow us on social media for real-time updates and exclusive
            content.
          </p>
          <div className="pt-2">
            <SocialLinks />
          </div>
        </div>
      </motion.div>

      {/* Mobile Layout */}
      <div className="border-t border-emerald-900 bg-emerald-950 py-8 lg:hidden">
        <Accordion type="multiple" className="w-full space-y-2">
          {/* About Section */}
          <AccordionItem value="about" className="border-emerald-900">
            <AccordionTrigger className="text-left text-white hover:no-underline">
              About Zeal News
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-3 text-sm text-emerald-100">
                Your trusted source for accurate, timely news across Africa and
                the world.
              </p>
              <Link
                href="/about"
                className="text-sm font-medium text-emerald-400 transition-colors duration-200 hover:text-emerald-300"
              >
                Learn more about us
              </Link>
            </AccordionContent>
          </AccordionItem>

          {/* Quick Links */}
          <MobileFooterLinkColumn
            title="Quick Links"
            links={[...primaryLinks, ...additionalLinks]}
            value="quick-links"
          />

          {/* Company */}
          <MobileFooterLinkColumn
            title="Company"
            links={[
              secondaryLinks[0],
              { label: "Contact Us", href: "/info/contact-us" },
              secondaryLinks[4],
            ]}
            value="company"
          />

          {/* Legal */}
          <MobileFooterLinkColumn
            title="Legal"
            links={[secondaryLinks[1], secondaryLinks[2], secondaryLinks[3]]}
            value="legal"
          />

          {/* Connect */}
          <AccordionItem value="connect" className="border-emerald-900">
            <AccordionTrigger className="text-left text-white hover:no-underline">
              Connect
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-3 text-sm text-emerald-100">
                Follow us on social media for real-time updates.
              </p>
              <div className="pt-2">
                <SocialLinks />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
