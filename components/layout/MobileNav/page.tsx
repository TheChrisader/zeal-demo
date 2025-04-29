"use client";

import { Bookmark, Download, Newspaper, Settings } from "lucide-react";
import { Link } from "@/i18n/routing";
import { usePathname } from "@/i18n/routing";

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <nav
      className={`fixed bottom-0 z-30 flex h-fit w-full rounded-lg px-1 min-[750px]:hidden`}
    >
      <ul className="flex w-full justify-around rounded-lg bg-background p-2 py-3">
        <li>
          <Link href="/">
            <div
              className={`flex flex-col items-center gap-1 ${pathname === "/" ? "text-primary" : "text-muted-alt"}`}
            >
              <Newspaper />
              <span className="text-xs">Feed</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/bookmarks">
            <div
              className={`flex flex-col items-center gap-1 ${pathname === "/bookmarks" ? "text-primary" : "text-muted-alt"}`}
            >
              <Bookmark />
              <span className="text-xs">Bookmarks</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/downloads">
            <div
              className={`flex flex-col items-center gap-1 ${pathname === "/downloads" ? "text-primary" : "text-muted-alt"}`}
            >
              <Download />
              <span className="text-xs">Downloads</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/settings/profile">
            <div
              className={`flex flex-col items-center gap-1 ${pathname.includes("/settings") ? "text-primary" : "text-muted-alt"}`}
            >
              <Settings />
              <span className="text-xs">Settings</span>
            </div>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default MobileNav;
