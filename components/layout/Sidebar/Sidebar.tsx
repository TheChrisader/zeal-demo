import React, { useEffect, useRef } from "react";
import Categories from "@/categories";
import { useResponsiveWidth } from "./hooks/useResponsiveWidth";
import { NavigationTree } from "./NavigationTree";
import { SidebarContent } from "./SidebarContent";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarHeader } from "./SidebarHeader";
import type { SidebarProps } from "./types";

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentPath,
}) => {
  const { sidebarWidth, isMobile, isTablet, isDesktop } = useResponsiveWidth();
  const sidebarRef = useRef<HTMLElement>(null);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDesktop) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, isDesktop]);

  // Focus management
  useEffect(() => {
    if (isOpen && sidebarRef.current && !isDesktop) {
      // Focus first focusable element when sidebar opens
      const firstFocusable = sidebarRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) as HTMLElement;

      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [isOpen, isDesktop]);

  // Style for the sidebar based on screen size
  const sidebarStyles = React.useMemo(() => {
    const baseStyles =
      "scrollbar-change fixed top-0 z-50 h-full overflow-x-auto backdrop-blur-lg bg-gradient-to-b from-white/90 via-white/80 to-white/90 dark:from-gray-950/90 dark:via-gray-950/80 dark:to-gray-950/90 border-r border-gray-200/50 dark:border-gray-800/50 shadow-2xl transition-all duration-500 ease-in-out";

    if (isMobile) {
      return `${baseStyles} left-0 w-full ${isOpen ? "translate-x-0" : "-translate-x-full"} ${isOpen ? "shadow-2xl shadow-black/10 dark:shadow-black/50" : ""}`;
    }

    if (isTablet) {
      return `${baseStyles} left-0 w-[280px] ${isOpen ? "translate-x-0" : "-translate-x-full"} ${isOpen ? "shadow-2xl shadow-black/10 dark:shadow-black/50" : ""}`;
    }

    // Desktop
    return `${baseStyles} left-0 w-[320px] ${isOpen ? "translate-x-0" : "-translate-x-full"} ${isOpen ? "shadow-2xl shadow-black/10 dark:shadow-black/50" : ""}`;
  }, [isOpen, isMobile, isTablet, isDesktop]);

  if (!isOpen && !isDesktop) {
    return null;
  }

  return (
    <>
      {/* Overlay - only for mobile/tablet */}
      {!isDesktop && (
        <div
          className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={onClose}
          aria-hidden={isOpen ? "false" : "true"}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={sidebarStyles}
        style={{
          width:
            typeof sidebarWidth === "string"
              ? sidebarWidth
              : `${sidebarWidth}px`,
        }}
        aria-label="Main navigation sidebar"
        role="complementary"
      >
        {/* Header */}
        <SidebarHeader onClose={onClose} isMobile={isMobile} />

        {/* Navigation Items */}
        <SidebarContent>
          <NavigationTree
            categories={Categories}
            currentPath={currentPath}
            onItemClick={isMobile ? onClose : undefined}
          />
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter />
      </aside>
    </>
  );
};
