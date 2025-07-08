import React, { useState } from "react";
import { ChevronDown, ChevronRight, Link2, Menu, X } from "lucide-react";
import Categories, {
  type Categories as CategoriesType,
  Category,
  extractPath,
} from "@/categories";
import { Link } from "@/i18n/routing";

interface BurgerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({
  isOpen,
  onToggle,
  className = "",
}) => {
  return (
    <button
      onClick={onToggle}
      className={`relative rounded-lg p-2 transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${className}`}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <div className="relative h-6 w-6">
        <Menu
          className={`absolute inset-0 h-6 w-6 text-gray-700 transition-all duration-300 ${
            isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
          }`}
        />
        <X
          className={`absolute inset-0 h-6 w-6 text-gray-700 transition-all duration-300 ${
            isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
          }`}
        />
      </div>
    </button>
  );
};

interface NavItemProps {
  category: Category;
  level: number;
  isOpen: boolean;
  currentPath?: string;
  isLast?: boolean;
  parentIsLast?: boolean[];
}

const NavItem: React.FC<NavItemProps> = ({
  category,
  level,
  isOpen,
  currentPath,
  isLast = false,
  parentIsLast = [],
}) => {
  const hasSubItems = category.sub && category.sub.length > 0;
  const hasPath = Boolean(category.path);
  const isActive = currentPath === category.path;

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (category.path) {
      console.log(`Navigate to: ${extractPath(category.name)}`);
    }
  };

  return (
    <div className="relative">
      {/* Tree structure lines */}
      <div className="flex items-center">
        {/* Vertical and horizontal connection lines */}
        {level > 0 && (
          <div className="flex items-center">
            {/* Vertical lines for parent levels */}
            {parentIsLast.map((isParentLast, index) => (
              <div key={index} className="flex w-6 justify-center">
                {!isParentLast && <div className="h-full w-px bg-border"></div>}
              </div>
            ))}

            {/* Current level connector */}
            <div className="relative flex h-6 w-6 items-center justify-center">
              {/* Vertical line */}
              {!isLast && (
                <div className="absolute bottom-0 left-1/2 top-6 w-px -translate-x-1/2 transform bg-border"></div>
              )}

              {/* Horizontal line */}
              <div className="absolute left-1/2 h-px w-3 bg-border"></div>

              {/* Tree node indicator */}
              <div className="relative z-10 h-2 w-2 rounded-full bg-muted-alt"></div>
            </div>
          </div>
        )}

        {/* Link content */}
        <div className={`ml-2 flex-1 ${level === 0 ? "ml-4" : ""}`}>
          {hasPath ? (
            <Link
              href={extractPath(category.name) || "/"}
              className={`group flex w-full items-center rounded-lg px-3 py-2 text-left transition-all duration-200 ${
                isActive
                  ? "font-medium text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span
                className={`${
                  level === 0
                    ? "text-base font-semibold"
                    : level === 1
                      ? "text-sm font-medium"
                      : "text-sm"
                }`}
              >
                {category.name}
              </span>

              {/* Folder icon for items with children */}
              {hasSubItems && <Link2 className="ml-2 size-4 text-muted-alt" />}

              {/* Active indicator */}
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary"></div>
              )}
            </Link>
          ) : (
            <div
              className={`flex items-center px-3 py-2 ${
                level === 0
                  ? "text-base font-semibold text-gray-800"
                  : level === 1
                    ? "text-sm font-medium text-gray-700"
                    : "text-sm text-gray-600"
              }`}
            >
              <span>{category.name}</span>

              {/* Folder icon for category headers */}
              {hasSubItems && (
                <div className="ml-2 text-gray-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sub-items - always visible, no accordion */}
      {hasSubItems && (
        <div className="relative">
          {/* Vertical line continuation */}
          {level > 0 && !isLast && (
            <div
              className="absolute left-0 top-0 h-full w-px bg-gray-300"
              style={{ left: `${parentIsLast.length * 24 + 12}px` }}
            ></div>
          )}

          {category.sub?.map((subCategory, index) => (
            <NavItem
              key={`${subCategory.name}-${index}`}
              category={subCategory}
              level={level + 1}
              isOpen={isOpen}
              currentPath={currentPath}
              isLast={index === category.sub!.length - 1}
              parentIsLast={[...parentIsLast, isLast]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentPath,
}) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`scrollbar-change fixed left-0 top-0 z-50 h-full w-80 transform overflow-x-auto bg-card shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ring bg-card-alt-bg p-4">
          <h2 className="text-lg font-semibold text-card-foreground">
            Navigation
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 transition-colors duration-200 hover:bg-card-alt-bg/60 lg:hidden"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto">
          <div className="px-2 py-4">
            {Categories.map((category, index) => (
              <NavItem
                key={`${category.name}-${index}`}
                category={category}
                level={0}
                isOpen={isOpen}
                currentPath={currentPath}
                isLast={index === Categories.length - 1}
                parentIsLast={[]}
              />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-card p-4">
          <p className="text-sm text-card-foreground">© Zeal News Africa</p>
        </div>
      </div>
    </>
  );
};
