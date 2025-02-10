import { Facebook, Instagram, Youtube } from "lucide-react";
import { Twitter } from "lucide-react";
import Link from "next/link";

export function SocialLinks() {
  return (
    <div className="flex items-center gap-4">
      <Link
        href="#"
        className="text-muted-foreground transition-colors hover:text-primary"
        aria-label="Facebook"
      >
        <Facebook className="h-5 w-5" />
      </Link>
      <Link
        href="#"
        className="text-muted-foreground transition-colors hover:text-primary"
        aria-label="Twitter"
      >
        <Twitter className="h-5 w-5" />
      </Link>
      <Link
        href="#"
        className="text-muted-foreground transition-colors hover:text-primary"
        aria-label="Instagram"
      >
        <Instagram className="h-5 w-5" />
      </Link>
      <Link
        href="#"
        className="text-muted-foreground transition-colors hover:text-primary"
        aria-label="YouTube"
      >
        <Youtube className="h-5 w-5" />
      </Link>
    </div>
  );
}
