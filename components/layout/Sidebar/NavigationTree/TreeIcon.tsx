import React from "react";
import { Link2, Play, Folder } from "lucide-react";
import type { TreeIconProps } from "../types";

export const TreeIcon: React.FC<TreeIconProps> = ({
  category,
  isActive,
  className = "",
}) => {
  const hasSubItems = category.sub && category.sub.length > 0;
  const hasPath = Boolean(category.path);

  // Watch category special icon
  if (category.name === "Watch") {
    return (
      <div className={`ml-2 p-1 rounded-lg transition-all duration-300 ${
        isActive ? "bg-primary/20" : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
      }`}>
        <Play
          className={`transition-all duration-300 ${
            isActive ? "text-primary" : "text-gray-500 dark:text-gray-400 group-hover:text-primary"
          }`}
          size={14}
          fill={isActive ? "currentColor" : "none"}
        />
      </div>
    );
  }

  // Link icon for items with children and a path
  if (hasSubItems && hasPath) {
    return (
      <div className={`ml-2 p-1 rounded-lg transition-all duration-300 ${
        isActive ? "bg-primary/20" : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
      }`}>
        <Link2
          className={`transition-all duration-300 ${
            isActive ? "text-primary" : "text-gray-500 dark:text-gray-400 group-hover:text-primary"
          } ${className}`}
          size={14}
        />
      </div>
    );
  }

  // Folder icon for items with children but no path (category headers)
  if (hasSubItems && !hasPath) {
    return (
      <div className="ml-2 p-1 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/20">
        <Folder
          className="text-amber-600 dark:text-amber-400 transition-all duration-300 group-hover:scale-110"
          strokeWidth={1.5}
          size={14}
        />
      </div>
    );
  }

  // No icon for regular items without children
  return null;
};