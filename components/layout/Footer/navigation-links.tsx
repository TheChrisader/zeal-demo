import { Link } from "@/i18n/routing";

const primaryLinks = [
  { href: "#", label: "Watch" },
  { href: "#", label: "Listen" },
  { href: "#", label: "Live TV" },
];

const secondaryLinks = [
  { href: "/info/terms-and-conditions", label: "Terms of Use" },
  { href: "/info/privacy-policy", label: "Privacy Policy" },
  { href: "/info/cookie-policy", label: "Cookie Policy" },
  { href: "/info/partner-with-us", label: "Partner With Us" },
  //   { href: "/ad-choices", label: "Ad Choices" },
  //   { href: "/accessibility", label: "Accessibility & CC" },
  //   { href: "/about", label: "About" },
  //   { href: "/newsletters", label: "Newsletters" },
  //   { href: "/transcripts", label: "Transcripts" },
];

export function NavigationLinks() {
  return (
    <nav className="space-y-6">
      {/* <ul className="flex flex-wrap items-center gap-6">
        {primaryLinks.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
        <li className="text-sm font-medium text-muted-foreground">
          FOLLOW ZEAL NEWS AFRICA
        </li>
      </ul> */}
      <ul className="flex flex-wrap gap-4">
        {secondaryLinks.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
