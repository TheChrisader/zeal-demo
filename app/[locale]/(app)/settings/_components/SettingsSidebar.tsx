"use client";
import {
  Bell,
  ChevronRight,
  Gift,
  Newspaper,
  Shield,
  User,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";
import { usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navItems: NavItem[] = [
  {
    href: "/settings/profile",
    label: "Profile",
    icon: User,
    description: "Manage your personal information",
  },
  {
    href: "/settings/notifications",
    label: "Notifications",
    icon: Bell,
    description: "Configure notification preferences",
  },
  {
    href: "/settings/preferences",
    label: "Preferences",
    icon: Newspaper,
    description: "Customize your news feed",
  },
  {
    href: "/settings/referral",
    label: "Referrals",
    icon: Gift,
    description: "Refer friends and earn rewards",
  },
  {
    href: "/settings/security",
    label: "Security",
    icon: Shield,
    description: "Protect your account",
  },
];

const SettingSidebar = () => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: Horizontal scrollable tabs */}
      <nav className="scrollbar-change scrollbar-change-mini w-full overflow-x-auto pb-2 min-[800px]:hidden">
        <div className="flex w-fit min-w-full gap-2 px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex min-w-fit flex-col items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200",
                  "hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                  isActive
                    ? "border border-primary/20 bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isActive
                        ? "scale-110 text-primary"
                        : "group-hover:scale-105",
                    )}
                  />
                  {isActive && (
                    <div className="absolute -inset-0.5 animate-pulse rounded-full bg-primary/20 blur-sm" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-center transition-all duration-200",
                    isActive ? "font-semibold" : "font-medium",
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="h-0.5 w-6 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: Vertical sidebar with improved design */}
      <nav className="scrollbar-change scrollbar-change-mini hidden max-w-xs min-[800px]:block">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  "hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                  isActive
                    ? "border border-primary/20 bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isActive
                        ? "scale-110 text-primary"
                        : "group-hover:scale-105",
                    )}
                  />
                  {isActive && (
                    <div className="absolute -inset-1 animate-pulse rounded-full bg-primary/20 blur-sm" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "transition-all duration-200",
                        isActive ? "font-semibold" : "font-medium",
                      )}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <ChevronRight className="size-3.5 text-primary/60" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default SettingSidebar;
