"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Link } from "@/i18n/routing";

const Logo = () => {
  const [logo, setLogo] = useState("/zeal_news_logo.png");
  const { theme } = useTheme();
  const colorScheme = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    if (theme === "dark" || (theme === "system" && colorScheme)) {
      setLogo("/zeal_news_logo_dark.png");
    } else {
      setLogo("/zeal_news_logo.png");
    }
  }, [theme, colorScheme]);

  return (
    <Link href="/">
      <img
        alt="zeal_news_logo"
        src={logo}
        className="mb-[34px] w-[150px] object-cover max-[1200px]:mb-0"
        height={34}
      />
    </Link>
  );
};

export default Logo;
