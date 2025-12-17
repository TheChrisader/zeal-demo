import React from "react";
import type { TreeLinesProps } from "../types";

export const TreeLines: React.FC<TreeLinesProps> = ({
  level,
  isLast,
  parentIsLast,
  hasChildren,
}) => {
  if (level === 0) return null;

  const nodeSize = 24;
  const lineHeight = 32;
  const strokeWidth = 1;

  return (
    <div className="flex items-center">
      {/* Vertical lines for parent levels */}
      {parentIsLast.map((isParentLast, index) => (
        <div key={index} className="flex w-6 justify-center">
          {!isParentLast && (
            <svg
              width={1}
              height={lineHeight}
              className="text-border"
              style={{ marginTop: 0 }}
            >
              <line
                x1={0.5}
                y1={0}
                x2={0.5}
                y2={lineHeight}
                stroke="currentColor"
                strokeWidth={strokeWidth}
              />
            </svg>
          )}
        </div>
      ))}

      {/* Current level connector */}
      <div className="relative flex size-6 items-center justify-center">
        {/* Vertical line from current node downward */}
        {!isLast && (
          <svg
            width={1}
            height={lineHeight}
            className="absolute text-border"
            style={{
              top: nodeSize / 2,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <line
              x1={0.5}
              y1={0}
              x2={0.5}
              y2={lineHeight}
              stroke="currentColor"
              strokeWidth={strokeWidth}
            />
          </svg>
        )}

        {/* Horizontal line from parent to current node */}
        <svg
          width={nodeSize / 2}
          height={1}
          className="absolute text-border"
          style={{
            top: "50%",
            left: 0,
            transform: "translateY(-50%)",
          }}
        >
          <line
            x1={0}
            y1={0.5}
            x2={nodeSize / 2}
            y2={0.5}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        </svg>

        {/* Tree node indicator */}
        <div
          className={`relative z-10 size-2 rounded-full ${
            hasChildren ? "bg-primary" : "bg-muted-alt"
          }`}
          style={{
            transition: "background-color 0.2s ease",
          }}
        />
      </div>
    </div>
  );
};