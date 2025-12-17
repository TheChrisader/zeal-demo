import React from "react";
import { X } from "lucide-react";
import type { SidebarHeaderProps } from "./types";

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  onClose,
  isMobile,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <header className="relative flex items-center justify-between border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-950/80 dark:to-gray-900/80 px-4 py-4 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-primary to-primary/70 animate-pulse"></div>
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
          Navigation
        </h2>
      </div>
      {(isMobile || true) && (
        <button
          onClick={onClose}
          onKeyDown={handleKeyDown}
          className="rounded-lg p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-900 dark:hover:to-gray-800 transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Close navigation menu"
        >
          <X className="size-5 transition-transform duration-300 hover:rotate-90" />
        </button>
      )}
    </header>
  );
};