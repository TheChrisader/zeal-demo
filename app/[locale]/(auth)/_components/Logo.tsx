"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Link } from "@/i18n/routing";
import ZealLogo from "@/assets/ZealLogo";

const Logo = () => {
  const [isDark, setIsDark] = useState(false);
  const { theme } = useTheme();
  const colorScheme = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    if (theme === "dark" || (theme === "system" && colorScheme)) {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, [theme, colorScheme]);

  return (
    <Link href="/">
      {/* <img
        alt="zeal_news_logo"
        src={logo}
        className="mb-[34px] w-[150px] object-cover max-[1200px]:mb-0"
        height={34}
      /> */}
      <ZealLogo
        className={`mb-[34px] max-[1200px]:mb-0 ${isDark ? "fill-white" : ""}`}
      />
    </Link>
  );
};

export default Logo;
