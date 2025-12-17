import React from "react";
import { Link } from "@/i18n/routing";
import type { TreeLinkProps } from "../types";

export const TreeLink: React.FC<TreeLinkProps> = ({
  category,
  isActive,
  children,
  href,
  onClick,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(e as any);
    }
  };

  const linkClasses = `
    relative flex w-full items-center rounded-xl px-3 py-2.5 text-sm
    transition-all duration-300 group
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950
    overflow-hidden
    ${
      isActive
        ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-semibold shadow-lg shadow-primary/10 dark:shadow-primary/20 border border-primary/20 dark:border-primary/30"
        : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-900 dark:hover:to-gray-800 hover:text-gray-900 dark:hover:text-white hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20 border border-transparent hover:border-gray-200/50 dark:hover:border-gray-700/50"
    }
  `;

  return (
    <Link
      href={href}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={linkClasses}
      aria-current={isActive ? "page" : undefined}
      role="menuitem"
    >
      {children}
    </Link>
  );
};