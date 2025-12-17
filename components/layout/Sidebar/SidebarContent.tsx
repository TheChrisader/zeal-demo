import React from "react";
import type { SidebarContentProps } from "./types";

export const SidebarContent: React.FC<SidebarContentProps> = ({ children }) => {
  return (
    <nav
      className="flex-1 overflow-y-auto scrollbar-change"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="px-3 py-4 space-y-1">{children}</div>
    </nav>
  );
};