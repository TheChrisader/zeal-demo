import React, { memo } from "react";
import { TreeNode } from "./TreeNode";
import { useNavigationState } from "../hooks/useNavigationState";
import Categories from "@/categories";
import type { NavigationTreeProps } from "../types";

const NavigationTreeComponent: React.FC<NavigationTreeProps> = ({
  categories: propCategories,
  currentPath,
  onItemClick,
}) => {
  // Use provided categories or default to Categories
  const { categories } = useNavigationState(
    propCategories ?? Categories,
    currentPath,
  );

  return (
    <div role="tree" aria-label="Navigation categories">
      {categories.map((category, index) => (
        <TreeNode
          key={`${category.name}-${index}`}
          category={category}
          level={0}
          isActive={
            currentPath === category.path ||
            (currentPath?.includes("watch") && category.name === "Watch")
          }
          currentPath={currentPath}
          onClick={onItemClick}
          isLast={index === categories.length - 1}
          parentIsLast={[]}
        />
      ))}
    </div>
  );
};

// Memoize the entire tree for performance
export const NavigationTree = memo(
  NavigationTreeComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.currentPath === nextProps.currentPath &&
      prevProps.onItemClick === nextProps.onItemClick &&
      prevProps.categories === nextProps.categories
    );
  },
);

NavigationTree.displayName = "NavigationTree";
