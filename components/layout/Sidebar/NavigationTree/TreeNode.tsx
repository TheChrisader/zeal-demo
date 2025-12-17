import React, { memo } from "react";
import { extractPath } from "@/categories";
import { TreeLines } from "./TreeLines";
import { TreeLink } from "./TreeLink";
import { TreeIcon } from "./TreeIcon";
import type { TreeNodeProps } from "../types";

const TreeNodeComponent: React.FC<TreeNodeProps> = ({
  category,
  level,
  isActive,
  currentPath,
  onClick,
  isLast = false,
  parentIsLast = [],
}) => {
  const hasSubItems = category.sub && category.sub.length > 0;
  const hasPath = Boolean(category.path);

  const handleNavigate = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
  };

  const nodeContent = (
    <div className="relative" role="none">
      {/* Tree structure lines */}
      <div className="flex items-center">
        <TreeLines
          level={level}
          isLast={isLast}
          parentIsLast={parentIsLast}
          hasChildren={hasSubItems}
        />

        {/* Link content */}
        <div className={`flex-1 ${level === 0 ? "ml-4" : "ml-2"}`}>
          {hasPath ? (
            <TreeLink
              category={category}
              isActive={isActive}
              href={extractPath(category.name) || "/watch"}
              onClick={handleNavigate}
            >
              <span className={level === 0 ? "font-semibold" : "font-normal"}>
                {category.name}
              </span>
              <TreeIcon category={category} isActive={isActive} />
            </TreeLink>
          ) : (
            <div className="flex items-center px-3 py-2.5 group" role="presentation">
              <div className="relative">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-500 uppercase tracking-wider bg-gradient-to-r from-gray-600 to-gray-400 dark:from-gray-500 dark:to-gray-400 bg-clip-text text-transparent">
                  {category.name}
                </span>
                <div className="absolute -bottom-0.5 left-0 h-px w-full bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700 dark:to-transparent group-hover:from-gray-400 dark:group-hover:from-gray-500 transition-all duration-300"></div>
              </div>
              <TreeIcon category={category} isActive={false} />
            </div>
          )}
        </div>
      </div>

      {/* Sub-items - always visible, no accordion */}
      {hasSubItems && (
        <div
          className="relative"
          role="group"
          aria-label={`${category.name} subcategories`}
        >
          {/* Vertical line continuation */}
          {level > 0 && !isLast && (
            <svg
              width={1}
              className="absolute text-border"
              style={{
                left: `${parentIsLast.length * 24 + 12}px`,
                top: 0,
                height: "100%",
              }}
            >
              <line
                x1={0.5}
                y1={0}
                x2={0.5}
                y2="100%"
                stroke="currentColor"
                strokeWidth={1}
              />
            </svg>
          )}

          {category.sub?.map((subCategory, index) => (
            <TreeNode
              key={`${subCategory.name}-${index}`}
              category={subCategory}
              level={level + 1}
              isActive={
                currentPath === extractPath(subCategory.name) ||
                (currentPath?.includes("watch") && subCategory.name === "Watch")
              }
              currentPath={currentPath}
              onClick={onClick}
              isLast={index === category.sub!.length - 1}
              parentIsLast={[...parentIsLast, isLast]}
            />
          ))}
        </div>
      )}
    </div>
  );

  return nodeContent;
};

// Memoize the component to prevent unnecessary re-renders
export const TreeNode = memo(TreeNodeComponent, (prevProps, nextProps) => {
  // Only re-render if essential props have changed
  return (
    prevProps.category.name === nextProps.category.name &&
    prevProps.level === nextProps.level &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.currentPath === nextProps.currentPath &&
    prevProps.isLast === nextProps.isLast &&
    prevProps.parentIsLast.length === nextProps.parentIsLast.length &&
    prevProps.parentIsLast.every((val, index) => val === nextProps.parentIsLast[index])
  );
});

TreeNode.displayName = "TreeNode";