"use client";

import { motion } from "framer-motion";
import { User } from "lucia";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { usePathname } from "@/i18n/routing";
// import ZealLogo from "@/assets/images/zeal_news_logo.png";
// import ZealLogoDark from "@/assets/images/zeal_news_logo_dark.png";
import NigeriaIcon from "@/assets/svgs/Countries/NigeriaIcon";
import BellIcon from "@/assets/svgs/utils/BellIcon";
import CollapseArrowIcon from "@/assets/svgs/utils/CollapseArrowIcon";
import PenIcon from "@/assets/svgs/utils/PenIcon";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Added Popover imports
import useAuth from "@/context/auth/useAuth";
import CountryDropdown, { useCountryContext } from "./menu/Country";
import NotificationsDropdown from "./menu/Notifications";
import ProfileDropdown from "./menu/Profile";
import WriterForm from "./popup/WriterForm";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNotificationContext } from "@/context/notifications/NotificationsProvider";
import { GH, KE, NG, UG, ZA, ZM } from "country-flag-icons/react/3x2";
import ZealLogo from "@/assets/ZealLogo";

interface UserActionProps {
  user: User | null;
}

const excludeFromPaths = ["editor"];

export const UserInitial = ({ userInitial }: { userInitial: string }) => {
  return (
    <div className="flex size-5 items-center justify-center rounded-full bg-success">
      <span className="text-center text-sm font-medium text-special-text">
        {userInitial}
      </span>
    </div>
  );
};

export const UserAvatar = ({ user }: { user: User }) => {
  const userInitial = user.display_name!.slice(0, 1).toUpperCase();

  if (!user?.avatar) {
    return <UserInitial userInitial={userInitial} />;
  }

  return (
    <div className="flex size-5 items-center justify-center rounded-full">
      <img
        src={user.avatar}
        className="w-8 rounded-full object-cover"
        alt="user avatar"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

const MainIcon = () => {
  const { country } = useCountryContext();

  if (country === "Nigeria") {
    return <NG className="size-6 rounded-full" />;
  } else if (country === "Ghana") {
    return <GH className="size-6 rounded-full" />;
  } else if (country === "Kenya") {
    return <KE className="size-6 rounded-full" />;
  } else if (country === "South Africa") {
    return <ZA className="size-6 rounded-full" />;
  } else if (country === "Uganda") {
    return <UG className="size-6 rounded-full" />;
  } else if (country === "Zambia") {
    return <ZM className="size-6 rounded-full" />;
  } else {
    return <NG className="size-6 rounded-full" />;
  }
};

const UserAction = ({ user }: UserActionProps) => {
  const matches = useMediaQuery("(max-width: 750px)");
  const [isMatch, setIsMatch] = useState(false);
  const { unread } = useNotificationContext();

  useEffect(() => {
    setIsMatch(matches);
  }, [matches]);

  if (!user) {
    return (
      <Link
        href={"/signin"}
        className="flex h-auto gap-2 rounded-full bg-background px-4 py-2 shadow-basic hover:bg-accent hover:text-accent-foreground"
      >
        <span className="text-sm font-medium text-muted-alt">Log In</span>
      </Link>
    );
  }

  return (
    <div className="flex gap-2">
      <CountryDropdown>
        <MainIcon />
        {/* <NigeriaIcon className="size-6 rounded-full" /> */}
        <CollapseArrowIcon />
      </CountryDropdown>
      {!isMatch && (
        <>
          <NotificationsDropdown>
            <BellIcon />
            {unread > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-normal leading-none text-[#ffffff]">
                {unread}
              </span>
            )}
          </NotificationsDropdown>

          <ProfileDropdown user={user}>
            <UserAvatar user={user} />
            <CollapseArrowIcon />
          </ProfileDropdown>
        </>
      )}
    </div>
  );
};

const Write = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Link
        className="flex h-auto gap-2 rounded-full bg-background px-4 py-2 shadow-basic hover:bg-accent hover:text-accent-foreground"
        href="/signup"
      >
        <PenIcon />
        <span className="text-sm font-medium text-muted-alt">Write</span>
      </Link>
    );
  }

  // Add check for pending upgrade
  if (user.upgrade_pending) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex h-auto cursor-default gap-2 rounded-full px-4 py-2 opacity-70 hover:bg-transparent"
            // Disabled style to indicate pending status
          >
            <PenIcon />
            <span className="text-sm font-medium text-muted-alt">Write</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-4" align="end" sideOffset={12}>
          <h4 className="font-semibold leading-none text-foreground">
            Application Pending Review
          </h4>
          <p className="mt-2 text-sm text-muted-foreground">
            Your writer application is currently being reviewed! We&apos;re
            excited about the possibility of you joining our platform.
            You&apos;ll receive a notification or email once the review is
            complete. Thanks for your patience!
          </p>
        </PopoverContent>
      </Popover>
    );
  }

  if (user.role !== "writer") {
    return (
      <WriterForm>
        <Button
          variant="outline"
          className="flex h-auto gap-2 rounded-full px-4 py-2"
        >
          <PenIcon />
          <span className="text-sm font-medium text-muted-alt">Write</span>
        </Button>
      </WriterForm>
    );
  }

  return (
    <Link
      className="flex h-auto gap-2 rounded-full bg-background px-4 py-2 shadow-basic hover:bg-accent hover:text-accent-foreground"
      href="/editor"
    >
      <PenIcon />
      <span className="text-sm font-medium text-muted-alt">Write</span>
    </Link>
  );
};

const Topbar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const { theme } = useTheme();

  const matches = useMediaQuery("(max-width: 750px)");
  const colorScheme = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    setShowActions(!matches);
  }, [matches]);

  useEffect(() => {
    if (theme === "dark" || (theme === "system" && colorScheme)) {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, [theme, colorScheme]);

  if (excludeFromPaths.includes(pathname.split("/")[1] as string)) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex h-fit items-center justify-between bg-card-alt-bg px-[100px] py-3 shadow-md max-[900px]:px-7">
        <div className="flex gap-[100px]">
          <Link href="/">
            {/* <Image
              // src={theme === "dark" ? ZealLogoDark : ZealLogo}
              src={logo}
              alt="logo"
              // height={20.4}
              priority
              unoptimized
              className="h-[20.4px] w-[117px] object-cover"
            /> */}
            {/* <img
              src={logo}
              className="h-[20.4px] w-[117px] object-cover"
              alt="logo"
            /> */}
            <ZealLogo className={`${isDark ? "fill-white" : ""}`} />
          </Link>
          {user && showActions && (
            <div className="flex gap-6">
              <div className="relative flex">
                <Link className="text-sm font-semibold text-success" href="/">
                  Feed
                </Link>
                {pathname === "/" && (
                  <motion.span
                    layoutId="topbarUnderline"
                    className="absolute bottom-[-19px] h-1 w-full rounded-full bg-success"
                  />
                )}
              </div>
              <div className="relative flex">
                <Link
                  className="text-sm font-semibold text-success"
                  href="/for-you"
                >
                  For you
                </Link>
                {pathname === "/for-you" && (
                  <motion.span
                    layoutId="topbarUnderline"
                    className="absolute bottom-[-19px] h-1 w-full rounded-full bg-success"
                  />
                )}
              </div>
              {/* <div className="relative flex">
                <Link
                  className="text-sm font-semibold text-success"
                  href="/bookmarks"
                >
                  Bookmarks
                </Link>
                {pathname === "/bookmarks" && (
                  <motion.span
                    layoutId="topbarUnderline"
                    className="absolute bottom-[-21px] h-1 w-full rounded-full bg-success"
                  />
                )}
              </div> */}
            </div>
          )}
        </div>
        <div className="flex h-fit items-center gap-5 max-[510px]:gap-2">
          <div className="max-[400px]:hidden">
            <Write />
            {/* <WriterForm>
              <PenIcon />
              <span className="text-sm font-medium text-muted-alt">Write</span>
            </WriterForm> */}
          </div>
          <div className="h-8">
            <Separator orientation="vertical" />
          </div>
          <UserAction user={user} />
        </div>
      </header>
      {/* <Separator /> */}
    </>
  );
};

export default Topbar;
