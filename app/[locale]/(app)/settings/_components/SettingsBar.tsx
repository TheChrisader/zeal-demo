"use client";
import DarkModeIcon from "@/assets/svgs/utils/DarkModeIcon";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SettingsBar() {
  const { theme, setTheme } = useTheme();
  const colorScheme = useMediaQuery("(prefers-color-scheme: dark)");
  const [isDark, setIsDark] = useState(false);
  const handleTheme = () => {
    setTheme(
      theme === "dark" || (theme === "system" && colorScheme)
        ? "light"
        : "dark",
    );
  };

  useEffect(() => {
    setIsDark(theme === "dark" || (theme === "system" && colorScheme));
  }, [theme, colorScheme]);

  return (
    <div>
      <div className="my-3 flex w-full items-center gap-5 px-[100px] max-[1024px]:px-7 max-[500px]:px-2">
        <div className="flex w-full items-center">
          <h1 className="text-foreground-alt text-2xl font-bold">Settings</h1>
        </div>
        <div className="h-8">
          <Separator orientation="vertical" />
        </div>
        <div className="flex items-center justify-between px-1 py-2">
          <div className="flex items-center gap-3">
            <DarkModeIcon />
            <span className="w-20 text-sm font-normal text-[#959595]">
              Dark Mode
            </span>
          </div>
          <Switch checked={isDark} onClick={handleTheme} />
        </div>
      </div>
      <Separator />
    </div>
  );
}
