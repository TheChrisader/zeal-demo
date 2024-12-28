"use client";

// import { PenIcon } from "lucide-react";
// import { Link } from "@/i18n/routing";
// import { usePathname } from "@/i18n/routing";
// import WriterForm from "@/components/layout/Topbar/popup/WriterForm";
// import { Button } from "@/components/ui/button";
// import useAuth from "@/context/auth/useAuth";

// const FloatingWrite = () => {
//   const { canWrite } = useAuth();
//   const pathname = usePathname();

//   if (pathname.includes("/write")) {
//     return null;
//   }

//   if (canWrite) {
//     return (
//       <Link
//         href="/write"
//         className="fixed bottom-20 right-6 z-50 flex items-center justify-center rounded-full bg-white p-6 text-sm font-medium shadow-2xl"
//       >
//         <PenIcon className="text-[#696969]" />
//       </Link>
//     );
//   }

//   return (
//     <WriterForm>
//       <Button
//         variant="outline"
//         className="fixed bottom-20 right-6 z-50 hidden items-center justify-center rounded-full px-6 py-9 text-sm font-medium shadow-2xl max-[400px]:flex"
//       >
//         <PenIcon className="text-[#696969]" />
//       </Button>
//     </WriterForm>
//   );
// };

// export default FloatingWrite;

"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Bell,
  Dice1Icon as Dice,
  LayoutGrid,
  Moon,
  MoreHorizontal,
  MoreVertical,
  PenSquare,
  Repeat,
  RotateCw,
  // Router,
  Settings,
  SlidersHorizontal,
  Sun,
  User,
} from "lucide-react";
import { type Router, useRouter } from "@/app/_components/useRouter";
import { useTheme } from "next-themes";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { NotificationDrawer } from "./_components/notifications/NotificationDrawer";
import { useNotificationContext } from "@/context/notifications/NotificationsProvider";
import useAuth from "@/context/auth/useAuth";
import useLocalStorage from "@/hooks/useLocalStorage";

interface Action {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

// const defaultActions = (router: Router, isDark: boolean): Action[] => [
//   {
//     id: "notifications",
//     icon: <Bell className="h-4 w-4" />,
//     label: "Notifications",
//   },
//   {
//     id: "profile",
//     icon: <User className="h-4 w-4" />,
//     label: "Profile",
//     onClick: () => {
//       router.push("/settings/profile");
//     },
//   },
//   {
//     id: "submit",
//     icon: <PenSquare className="h-4 w-4" />,
//     label: "Write",
//     onClick: () => {
//       router.push("/write");
//     },
//   },
//   { id: "random", icon: <Dice className="h-4 w-4" />, label: "Random" },
//   { id: "dark", icon: isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />, label: "Dark mode" },
//   // { id: "settings", icon: <Settings className="h-4 w-4" />, label: "Settings", onClick: () => {router.push("/settings/profile")} },
//   // { id: "swipe", icon: <Repeat className="h-4 w-4" />, label: "Swipe mode" },
//   // {
//   //   id: "view",
//   //   icon: <LayoutGrid className="h-4 w-4" />,
//   //   label: "Change View",
//   // },
//   {
//     id: "refresh",
//     icon: <RotateCcw className="h-4 w-4" />,
//     label: "Refresh",
//     onClick: () => {
//       router.refresh();
//       location.reload();
//     },
//   },
//   {
//     id: "preferences",
//     icon: <SlidersHorizontal className="h-4 w-4" />,
//     label: "Preferences",
//     onClick: () => {
//       router.push("/settings/preferences");
//     },
//   },
// ];

export default function FloatingWrite() {
  const { canWrite } = useAuth();
  const router: Router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  const { theme, setTheme } = useTheme();
  const colorScheme = useMediaQuery("(prefers-color-scheme: dark)");
  const [isDark, setIsDark] = React.useState(false);
  const handleTheme = () => {
    setTheme(
      theme === "dark" || (theme === "system" && colorScheme)
        ? "light"
        : "dark",
    );
  };
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] =
    React.useState(false);

  const [animateRandom, setAnimateRandom] = React.useState(false);
  const [animateRefresh, setAnimateRefresh] = React.useState(false);

  const { unread } = useNotificationContext();

  React.useEffect(() => {
    setIsDark(theme === "dark" || (theme === "system" && colorScheme));
  }, [theme, colorScheme]);

  const defaultActions = React.useMemo(() => {
    // const defaultActions = (router: Router, isDark: boolean): Action[] =>
    const actions: Action[] = [
      {
        id: "notifications",
        icon: <Bell className="h-4 w-4" />,
        label: "Notifications",
        onClick: () => {
          setIsNotificationsDrawerOpen(true);
        },
      },
      {
        id: "profile",
        icon: <User className="h-4 w-4" />,
        label: "Profile",
        onClick: () => {
          router.push("/settings/profile");
          setIsOpen(false);
        },
      },
      {
        id: "submit",
        icon: <PenSquare className="h-4 w-4" />,
        label: "Write",
        onClick: () => {
          router.push("/write");
          setIsOpen(false);
        },
      },
      {
        id: "random",
        icon: (
          <Dice className={`h-4 w-4 ${animateRandom ? "animate-spin" : ""}`} />
        ),
        label: "Random",
        onClick: async () => {
          setAnimateRandom(true);
          const response = await fetch(`/api/v1/random/post`);
          const { slug } = await response.json();
          router.push(`/post/${slug}`);
          setAnimateRandom(false);
          setIsOpen(false);
        },
      },
      {
        id: "dark",
        icon: isDark ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        ),
        label: "Toggle theme",
        onClick: handleTheme,
      },
      // { id: "settings", icon: <Settings className="h-4 w-4" />, label: "Settings", onClick: () => {router.push("/settings/profile")} },
      // { id: "swipe", icon: <Repeat className="h-4 w-4" />, label: "Swipe mode" },
      // {
      //   id: "view",
      //   icon: <LayoutGrid className="h-4 w-4" />,
      //   label: "Change View",
      // },
      {
        id: "refresh",
        icon: (
          <RotateCw
            className={`h-4 w-4 ${animateRefresh ? "animate-spin" : ""}`}
          />
        ),
        label: "Refresh",
        onClick: () => {
          setAnimateRefresh(true);
          router.refresh();
          location.reload();
        },
      },
      {
        id: "preferences",
        icon: <SlidersHorizontal className="h-4 w-4" />,
        label: "Preferences",
        onClick: () => {
          router.push("/settings/preferences");
          setIsOpen(false);
        },
      },
    ];

    if (canWrite) {
      return actions;
    } else {
      return actions.filter((action) => action.label !== "Write");
    }
  }, [isDark, theme, animateRandom, animateRefresh, canWrite]);

  // const [visibleActions, setVisibleActions] = React.useState<Set<string>>(
  //   new Set(defaultActions.map((action) => action.id)),
  // );
  const getDefaultActions = () => {
    const visibleActions: { [key: string]: boolean } = {};
    for (const action of defaultActions) {
      visibleActions[action.id] = true;
    }
    return visibleActions;
  };
  const [visibleActions, setVisibleActions] = useLocalStorage<
    Record<string, boolean>
  >("filtered-actions", getDefaultActions());
  const [isVisible, setIsVisible] = React.useState(true);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current + 10) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 10) {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredActions = defaultActions.filter(
    (action) => visibleActions[action.id],
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-20 right-4 z-50 md:hidden"
        >
          <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
              <Button
                size="icon"
                className="relative h-14 w-14 rounded-full bg-primary shadow-lg"
              >
                <MoreHorizontal className="h-6 w-6" />
                {unread > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-normal leading-none text-[#ffffff]">
                    {unread}
                  </span>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="w-full">
                <DrawerHeader className="items-center p-2 pt-0">
                  <DrawerTitle className="justify-betwee flex items-center">
                    <div className="flex w-full justify-center">
                      <span className="text-center text-lg font-semibold">
                        More actions
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            Action visibility
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {defaultActions.map((action) => (
                              <DropdownMenuItem
                                key={action.id}
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Checkbox
                                  id={action.id}
                                  checked={visibleActions[action.id]}
                                  onCheckedChange={(checked) => {
                                    console.log(visibleActions, "!!!!!!!!");
                                    const newVisibleActions = {
                                      ...visibleActions,
                                    };
                                    if (checked) {
                                      newVisibleActions[action.id] = true;
                                    } else {
                                      newVisibleActions[action.id] = false;
                                    }
                                    setVisibleActions(newVisibleActions);
                                  }}
                                />
                                <label
                                  htmlFor={action.id}
                                  className="ml-2 flex items-center gap-2"
                                >
                                  {action.icon} {action.label}
                                </label>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        {/* <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => {
                            setVisibleActions(
                              new Set(
                                defaultActions.map((action) => action.id),
                              ),
                            );
                          }}
                        >
                          Reset order
                        </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </DrawerTitle>
                </DrawerHeader>
                <div className="grid grid-cols-4 gap-2 px-6 pb-10">
                  {filteredActions.map((action: Action) => (
                    <Button
                      key={action.id}
                      variant="ghost"
                      className="flex h-20 w-full flex-col items-center justify-center gap-2 rounded-xl"
                      onClick={() => {
                        action.onClick?.();
                        // setIsOpen(false);
                      }}
                    >
                      <div className="relative rounded-full bg-muted p-3">
                        {action.icon}
                        {action.label === "Notifications" && unread > 0 && (
                          <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-normal leading-none text-[#ffffff]">
                            {unread}
                          </span>
                        )}
                      </div>
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
          <NotificationDrawer
            isOpen={isNotificationsDrawerOpen}
            setOpen={setIsNotificationsDrawerOpen}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
