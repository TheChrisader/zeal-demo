"use client";

import { MoreHorizontal } from "lucide-react";
import { extractPath } from "@/categories";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "@/i18n/routing";

interface CategoryListProps {
  categories: string[];
}

const CategoryListClient = ({ categories }: CategoryListProps) => {
  // Show 3 categories on mobile, 4 on desktop
  const mobileLimit = 3;
  const desktopLimit = 4;

  const visibleMobileCategories = categories.slice(0, mobileLimit);
  const visibleDesktopCategories = categories.slice(0, desktopLimit);

  const hiddenMobileCategories = categories.slice(mobileLimit);
  const hiddenDesktopCategories = categories.slice(desktopLimit);

  const hasHiddenMobileCategories = hiddenMobileCategories.length > 0;
  const hasHiddenDesktopCategories = hiddenDesktopCategories.length > 0;

  return (
    <div className="flex flex-wrap gap-1 text-sm font-normal text-muted-alt">
      <span>Writer for</span>

      {/* Mobile view (visible on small screens) */}
      <div className="flex gap-1 md:hidden">
        {visibleMobileCategories.map((category) => (
          <Badge
            key={category}
            variant="secondary"
            className="transition-all duration-300 hover:scale-105 hover:shadow-sm active:scale-95"
          >
            <Link href={extractPath(category)}>{category}</Link>
          </Badge>
        ))}

        {hasHiddenMobileCategories && (
          <Popover>
            <div className="group">
              <PopoverTrigger asChild>
                <button
                  className="flex h-6 items-center justify-center rounded-full bg-secondary px-2 text-secondary-foreground transition-all duration-300 hover:scale-105 hover:bg-secondary/90 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 active:scale-95"
                  aria-label="Show more categories"
                >
                  <MoreHorizontal className="size-4 transition-transform duration-300 group-hover:rotate-180" />
                </button>
              </PopoverTrigger>
            </div>
            <PopoverContent
              className="flex w-auto flex-wrap gap-1 p-2 duration-200 animate-in zoom-in-50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-50"
              align="start"
              sideOffset={5}
              avoidCollisions
              collisionPadding={10}
            >
              {hiddenMobileCategories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="transition-all duration-300 hover:scale-105 hover:shadow-sm active:scale-95"
                >
                  <Link href={extractPath(category)}>{category}</Link>
                </Badge>
              ))}
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Desktop view (visible on medium screens and up) */}
      <div className="hidden gap-1 md:flex">
        {visibleDesktopCategories.map((category) => (
          <Badge
            key={category}
            variant="secondary"
            className="transition-all duration-300 hover:scale-105 hover:shadow-sm active:scale-95"
          >
            <Link href={extractPath(category)}>{category}</Link>
          </Badge>
        ))}

        {hasHiddenDesktopCategories && (
          <Popover>
            <div className="group">
              <PopoverTrigger asChild>
                <button
                  className="flex h-6 items-center justify-center rounded-full bg-secondary px-2 text-secondary-foreground transition-all duration-300 hover:scale-105 hover:bg-secondary/90 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 active:scale-95"
                  aria-label="Show more categories"
                >
                  <MoreHorizontal className="size-4 transition-transform duration-300 group-hover:rotate-180" />
                </button>
              </PopoverTrigger>
            </div>
            <PopoverContent
              className="flex w-auto flex-wrap gap-1 p-2 duration-200 animate-in zoom-in-50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-50"
              align="start"
              sideOffset={5}
              avoidCollisions
              collisionPadding={10}
            >
              {hiddenDesktopCategories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="transition-all duration-300 hover:scale-105 hover:shadow-sm active:scale-95"
                >
                  <Link href={extractPath(category)}>{category}</Link>
                </Badge>
              ))}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default CategoryListClient;
