"use client";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SettingSidebar = () => {
  const pathname = usePathname();
  return (
    <>
      <nav className="scrollbar-change scrollbar-change-mini w-1/4 max-[800px]:w-full max-[800px]:overflow-auto">
        <ul className="flex w-fit flex-col items-center gap-4 max-[800px]:flex-row max-[800px]:justify-around max-[800px]:pb-3">
          <li className="flex">
            <Link
              href="/settings/profile"
              className={`whitespace-nowrap text-center text-base ${pathname === "/settings/profile" ? "text-lg font-bold text-primary" : "text-[#959595]"}`}
            >
              Profile Settings
            </Link>
          </li>
          <li className="flex">
            <Link
              href="/settings/notifications"
              className={`whitespace-nowrap text-center text-base ${pathname === "/settings/notifications" ? "text-lg font-bold text-primary" : "text-[#959595]"}`}
            >
              Notifications Settings
            </Link>
          </li>
          <li className="flex">
            <Link
              href="/settings/preferences"
              className={`whitespace-nowrap text-center text-base ${pathname === "/settings/preferences" ? "text-lg font-bold text-primary" : "text-[#959595]"}`}
            >
              News Preferences Settings
            </Link>
          </li>
          <li className="flex">
            <Link
              href="/settings/security"
              className={`whitespace-nowrap text-center text-base ${pathname === "/settings/security" ? "text-lg font-bold text-primary" : "text-[#959595]"}`}
            >
              Security Settings
            </Link>
          </li>
        </ul>
      </nav>
      <Separator
        orientation="horizontal"
        className="hidden max-[800px]:mb-9 max-[800px]:block"
      />
    </>
  );
};

export default SettingSidebar;
