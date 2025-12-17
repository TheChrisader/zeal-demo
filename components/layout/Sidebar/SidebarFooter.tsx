import React from "react";
import type { SidebarFooterProps } from "./types";

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  className = "",
}) => {
  return (
    <footer
      className={`relative border-t border-gray-200/50 bg-gradient-to-t from-white/80 to-white/60 p-4 backdrop-blur-md dark:border-gray-800/50 dark:from-gray-950/80 dark:to-gray-950/60 ${className}`}
    >
      <div className="flex items-center justify-between">
        <p className="bg-gradient-to-r from-gray-600 to-gray-400 bg-clip-text text-xs text-gray-600 dark:from-gray-400 dark:to-gray-500 dark:text-gray-400">
          © 2025 Zeal News Africa
        </p>
      </div>
    </footer>
  );
};
