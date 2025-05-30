import { User } from "lucia";
import { Link } from "@/i18n/routing";
import DarkModeIcon from "@/assets/svgs/utils/DarkModeIcon";
import LogOutIcon from "@/assets/svgs/utils/LogOutIcon";
import PenIcon from "@/assets/svgs/utils/PenIcon";
import SettingsIcon from "@/assets/svgs/utils/SettingsIcon";
import { Button } from "@/components/ui/button";
import {
  Popover,
  // PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import useAuth from "@/context/auth/useAuth";
import { UserAvatar } from "..";
import LogoutAlert from "../popup/Logout";
import { useTheme } from "next-themes";
import { Download } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const ProfileDropdown = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) => {
  const { canWrite } = useAuth();
  const { theme, setTheme } = useTheme();
  const colorScheme = useMediaQuery("(prefers-color-scheme: dark)");
  const handleTheme = () => {
    setTheme(
      theme === "dark" || (theme === "system" && colorScheme)
        ? "light"
        : "dark",
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className="flex h-auto items-center gap-2 rounded-full px-2"
        >
          {children}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-4" align="end" sideOffset={12}>
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <h3 className="text-foreground-alt text-lg font-semibold">
            {user.display_name}
          </h3>
        </div>
        <Separator className="my-3" />
        <div className="flex flex-col gap-1">
          {canWrite && (
            <Link
              href={"/drafts"}
              className="hover:bg-subtle-hover-bg flex items-center justify-between rounded-md px-1 py-2"
            >
              <div className="flex items-center gap-3">
                <PenIcon />
                <span className="text-sm font-normal text-[#959595]">
                  My Drafts
                </span>
              </div>
            </Link>
          )}
          <Link
            href={"/settings/profile"}
            className="hover:bg-subtle-hover-bg flex items-center justify-between rounded-md px-1 py-2"
          >
            <div className="flex items-center gap-3">
              <SettingsIcon />
              <span className="text-sm font-normal text-[#959595]">
                Settings
              </span>
            </div>
          </Link>
          <Link
            href={"/downloads"}
            className="hover:bg-subtle-hover-bg flex items-center justify-between rounded-md px-1 py-2"
          >
            <div className="flex items-center gap-3">
              <Download className="text-[#959595]" />
              <span className="text-sm font-normal text-[#959595]">
                Downloads
              </span>
            </div>
          </Link>
          <div className="flex items-center justify-between px-1 py-2">
            <div className="flex items-center gap-3">
              <DarkModeIcon />
              <span className="text-sm font-normal text-[#959595]">
                Dark Mode
              </span>
            </div>
            <Switch
              checked={theme === "dark" || (theme === "system" && colorScheme)}
              onClick={handleTheme}
            />
          </div>
          {/* <div className="flex items-center justify-between"> */}
          <LogoutAlert>
            <div className="flex items-center gap-3">
              <LogOutIcon />
              <span className="text-sm font-normal text-[#959595]">
                Log Out
              </span>
            </div>
          </LogoutAlert>
          {/* </div> */}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProfileDropdown;
