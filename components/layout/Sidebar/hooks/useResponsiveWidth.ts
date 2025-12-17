import { useState, useEffect, useMemo } from "react";
import type { ResponsiveWidthReturn, SidebarWidth } from "../types";

export const useResponsiveWidth = (): ResponsiveWidthReturn => {
  const [windowWidth, setWindowWidth] = useState(() => {
    if (typeof window === "undefined") return 1024;
    return window.innerWidth;
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { widthType, sidebarWidth, isMobile, isTablet, isDesktop } = useMemo(() => {
    if (windowWidth < 768) {
      return {
        widthType: "mobile" as SidebarWidth,
        sidebarWidth: "100%",
        isMobile: true,
        isTablet: false,
        isDesktop: false,
      };
    } else if (windowWidth < 1024) {
      return {
        widthType: "tablet" as SidebarWidth,
        sidebarWidth: 280,
        isMobile: false,
        isTablet: true,
        isDesktop: false,
      };
    } else {
      return {
        widthType: "desktop" as SidebarWidth,
        sidebarWidth: 320,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
      };
    }
  }, [windowWidth]);

  return {
    sidebarWidth,
    widthType,
    isMobile,
    isTablet,
    isDesktop,
  };
};