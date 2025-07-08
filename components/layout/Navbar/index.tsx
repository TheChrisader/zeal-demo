"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { usePathname } from "@/i18n/routing";
import { useRouter } from "@/app/_components/useRouter";
import React, { useEffect, useMemo, useRef, useState } from "react";
import FilterIcon from "@/assets/svgs/utils/FilterIcon";
import SearchInput from "@/components/forms/Input/SearchInput";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDraggable } from "@/hooks/useDraggable";
import { CATEGORIES } from "@/types/utils/category.type";
import { getCategoryFromPath } from "@/utils/path.utils";
// import FiltersDropdown from "./menu/Filters";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { ChevronDown, Search } from "lucide-react";
import { NavigationMenuContent } from "@radix-ui/react-navigation-menu";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { waitUntil } from "@/utils/waitUntil";
import dynamic from "next/dynamic";
import useScrollDetection from "@/hooks/useScrolldetection";
import Categories from "@/categories";

const FiltersDropdown = dynamic(() => import("./menu/Filters"), { ssr: false });

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
  const params = useSearchParams();
  const [current, subCurrent] = getCategoryFromPath(pathname);
  const [selected, setSelected] = useState(current);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const [isMatch, setIsMatch] = useState(false);
  const [hideSearch, setHideSearch] = useState(false);

  const matches = useMediaQuery("( max-width: 500px )");

  const { hasScrolled, scrollPosition } = useScrollDetection(20);

  useEffect(() => {
    setShowFilters(!!params.get("query"));
  }, [params]);

  useEffect(() => {
    setIsMatch(matches);
  }, [matches]);

  useEffect(() => {
    const current = getCategoryFromPath(pathname)[0];
    setSelected(current);
  }, [pathname]);

  useEffect(() => {
    setHideSearch(hasScrolled);
  }, [hasScrolled]);

  const ref =
    useRef<HTMLUListElement>() as React.MutableRefObject<HTMLUListElement>;
  // const { events } = useDraggable(ref);

  // const MotionSearch = motion(Search);

  return (
    <>
      <div className="sticky top-[60.5px] z-20 bg-card-alt-bg max-[750px]:top-[59px] max-[500px]:hidden max-[400px]:top-[55px]">
        <div
          className={`relative flex items-center justify-center gap-5 px-[100px] max-[900px]:px-7 max-[600px]:gap-2 max-[500px]:flex-col`}
        >
          <NavigationMenu className="mt-3 flex [&>div]:flex">
            <NavigationMenuList
              // ref={ref}
              // {...events}
              // className="scrollbar-change scrollbar-change-mini flex w-[60vw] items-center overflow-x-auto p-1 pb-3 max-[500px]:w-[90vw]"
              className="p-1 pb-3"
            >
              {Categories.map((item) => {
                // TODO: Change Button to Link
                return (
                  // <li className="relative" key={item.name}>
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
                          // if (item.name === "For you") {
                          //   router.push("/");
                          // } else {
                          router.push(`${item.path}`);
                          // }
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

                  // </li>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
          {/* {!isMatch && (
          <div className="h-8 max-[500px]:hidden">
            <Separator orientation="vertical" />
          </div>
        )} */}
          {/* {hideSearch && isMatch ? (
          <motion.div
            layoutId="search"
            className="absolute bottom-[-15px] z-50 flex w-[240px] justify-center"
            transition={{
              layout: { duration: 0.1 },
            }}
          >
            <motion.button
              className="flex rounded-full bg-card-alt-bg p-1 shadow-basic"
              onClick={() => {
                setHideSearch(false);
              }}
            >
              <MotionSearch className="text-muted-alt" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            layoutId="search"
            className="flex items-center gap-3"
            transition={{
              layout: { duration: 0.5 },
            }}
          >
            <SearchInput
              // placeholder="Search for any news"
              className="max-[500px]:mb-2"
            />
            {showFilters && (
              <FiltersDropdown>
                <FilterIcon />
              </FiltersDropdown>
            )}
          </motion.div>
        )} */}
        </div>
        <Separator />
      </div>
      <div className="hidden max-[500px]:mb-2 max-[500px]:block"></div>
    </>
  );
};

export default Navbar;
