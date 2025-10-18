"use client";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";
import { usePathname } from "@/i18n/routing";

const SettingSidebar = () => {
  const pathname = usePathname();
  return (
    <>
      <nav className="scrollbar-change scrollbar-change-mini w-fit max-[800px]:w-full max-[800px]:overflow-auto">
        <ul className="flex w-fit flex-col items-start gap-4 max-[800px]:flex-row max-[800px]:justify-around max-[800px]:pb-3">
          <li className="flex">
            <Link
              href="/settings/profile"
              className={`whitespace-nowrap text-center text-base ${pathname === "/settings/profile" ? "font-bold text-primary" : "text-[#959595]"}`}
            >
              Profile
            </Link>
          </li>
          <div className="h-5 min-[800px]:hidden">
            <Separator orientation="vertical" className="w-[2px]" />
          </div>
          <li className="flex">
            <Link
              href="/settings/notifications"
              className={`whitespace-nowrap text-center text-base ${pathname === "/settings/notifications" ? "font-bold text-primary" : "text-[#959595]"}`}
            >
              Notifications
            </Link>
          </li>
          <div className="h-5 min-[800px]:hidden">
            <Separator orientation="vertical" className="w-[2px]" />
          </div>
          <li className="flex">
            <Link
              href="/settings/preferences"
              className={`whitespace-nowrap text-center text-base ${pathname === "/settings/preferences" ? "font-bold text-primary" : "text-[#959595]"}`}
            >
              News Preferences
            </Link>
          </li>
          <div className="h-5 min-[800px]:hidden">
            <Separator orientation="vertical" className="w-[2px]" />
          </div>
          <li className="flex">
            <Link
              href="/settings/referral"
              className={`whitespace-nowrap text-center text-base ${pathname === "/settings/referral" ? "font-bold text-primary" : "text-[#959595]"}`}
            >
              Referrals
            </Link>
          </li>
          <div className="h-5 min-[800px]:hidden">
            <Separator orientation="vertical" className="w-[2px]" />
          </div>
          <li className="flex">
            <Link
              href="/settings/security"
              className={`whitespace-nowrap text-center text-base ${pathname === "/settings/security" ? "font-bold text-primary" : "text-[#959595]"}`}
            >
              Security
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
