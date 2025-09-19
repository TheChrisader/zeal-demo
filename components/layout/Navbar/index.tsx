"use client";

import { NavigationMenuContent } from "@radix-ui/react-navigation-menu";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@/app/_components/useRouter";
import FilterIcon from "@/assets/svgs/utils/FilterIcon";
import Categories from "@/categories";
import SearchInput from "@/components/forms/Input/SearchInput";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { useDraggable } from "@/hooks/useDraggable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import useScrollDetection from "@/hooks/useScrolldetection";
import { usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/types/utils/category.type";
import { getCategoryFromPath } from "@/utils/path.utils";
// import FiltersDropdown from "./menu/Filters";
import { waitUntil } from "@/utils/waitUntil";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { current: boolean }
>(({ className, title, children, current, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={props.href!}
          ref={ref}
          className={cn(
            `block select-none space-y-1 rounded-md p-3 leading-none text-muted-alt no-underline outline-none transition-colors hover:bg-accent hover:text-primary focus:bg-accent focus:text-accent-foreground ${current ? "text-primary" : ""}`,
            className,
          )}
          {...props}
        >
          {/* <div className="text-sm font-medium leading-none">{title}</div> */}
          <p
            className={`line-clamp-2 text-base leading-snug ${current ? "!text-primary" : ""}`}
          >
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

const Navbar = () => {
  const pathname = usePathname();
  const [current] = getCategoryFromPath(pathname);
  const [selected, setSelected] = useState(current);
  const router = useRouter();

  // const { hasScrolled, scrollPosition } = useScrollDetection(20);

  useEffect(() => {
    const current = getCategoryFromPath(pathname)[0];
    setSelected(current);
  }, [pathname]);

  return (
    <>
      <div className="bg-card-alt-bg">
        <div
          className={`relative flex items-center justify-center gap-5 max-[600px]:gap-2`}
        >
          <NavigationMenu className="flex [&>div]:flex">
            <NavigationMenuList className="space-x-0">
              {Categories.map((item) => {
                return (
                  <NavigationMenuItem className="relative" key={item.name}>
                    <NavigationMenuTrigger asChild>
                      <Button
                        variant={"outline"}
                        onMouseOver={() => {
                          setSelected(item.name);
                        }}
                        onMouseLeave={() => {
                          setSelected(current);
                        }}
                        onClick={() => {
                          router.push(`${item.path}`);
                        }}
                        className={`z-20 flex h-auto gap-1 rounded-[12px] bg-transparent p-1 px-2 shadow-none hover:bg-transparent focus:bg-transparent`}
                      >
                        <span
                          className={`text-sm font-medium ${selected !== item.name ? "text-muted-alt" : "text-primary"}`}
                        >
                          {item.name}
                        </span>
                      </Button>
                    </NavigationMenuTrigger>

                    {selected === item.name && (
                      <motion.div
                        layoutId="navHighlight"
                        transition={{
                          type: "spring",
                          stiffness: 120,
                          damping: 12,
                          duration: 1,
                        }}
                        className="absolute bottom-0 z-[-1] size-full rounded-[12px] outline outline-1 outline-primary"
                      ></motion.div>
                    )}
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </>
  );
};

export default Navbar;
