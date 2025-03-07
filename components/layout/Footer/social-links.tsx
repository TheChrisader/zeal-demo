import { Facebook, Instagram, Youtube } from "lucide-react";
import { Twitter } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import Link from "next/link";

export function SocialLinks() {
  return (
    <div className="flex items-center gap-4">
      <Link
        href="https://www.facebook.com/share/14SxxXDRa9"
        className="text-muted-foreground transition-colors hover:text-primary"
        aria-label="Facebook"
      >
        <Facebook className="h-5 w-5" />
      </Link>
      <Link
        href="https://x.com/zealnewsafrica"
        className="text-muted-foreground transition-colors hover:text-primary"
        aria-label="Twitter"
      >
        <Twitter className="h-5 w-5" />
      </Link>
      <Link
        href="https://www.instagram.com/zealnewsafrica/"
        className="text-muted-foreground transition-colors hover:text-primary"
        aria-label="Instagram"
      >
        <Instagram className="h-5 w-5" />
      </Link>
      <Link
        href="https://www.tiktok.com/@zeal.news.africa"
        className="text-muted-foreground transition-colors hover:text-primary"
        aria-label="TikTok"
      >
        <FaTiktok className="h-5 w-5" />
      </Link>
    </div>
  );
}
