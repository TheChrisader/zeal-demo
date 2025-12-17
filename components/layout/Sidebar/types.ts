import { Category } from "@/categories";

export interface TreeNodeProps {
  category: Category;
  level: number;
  isActive: boolean;
  currentPath?: string;
  onClick?: () => void;
  isLast?: boolean;
  parentIsLast?: boolean[];
}

export interface TreeLinkProps {
  category: Category;
  isActive: boolean;
  children: React.ReactNode;
  href: string;
  onClick?: (e: React.MouseEvent) => void;
}

export interface TreeIconProps {
  category: Category;
  isActive: boolean;
  className?: string;
}

export interface TreeLinesProps {
  level: number;
  isLast: boolean;
  parentIsLast: boolean[];
  hasChildren: boolean;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
}

export interface SidebarHeaderProps {
  onClose: () => void;
  isMobile: boolean;
}

export interface SidebarContentProps {
  children: React.ReactNode;
}

export interface SidebarFooterProps {
  className?: string;
}

export interface NavigationTreeProps {
  categories: Category[];
  currentPath?: string;
  onItemClick?: () => void;
}

export type SidebarWidth = "mobile" | "tablet" | "desktop";

export interface ResponsiveWidthReturn {
  sidebarWidth: number | string;
  widthType: SidebarWidth;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}