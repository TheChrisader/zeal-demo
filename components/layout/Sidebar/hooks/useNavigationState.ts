import { useMemo } from "react";
import { extractPath } from "@/categories";
import type { Category } from "@/categories";

export const useNavigationState = (
  categories: Category[] | undefined,
  currentPath?: string
) => {
  const { itemsWithWatch, activeItem } = useMemo(() => {
    // Ensure categories is an array
    const categoriesArray = categories || [];

    // Insert Watch category after Home
    const itemsWithWatch = [...categoriesArray];
    itemsWithWatch.splice(1, 0, {
      name: "Watch",
      path: "/watch",
    });

    // Find active item
    const findActiveItem = (items: Category[]): Category | null => {
      for (const item of items) {
        const itemPath = extractPath(item.name);
        if (
          currentPath === itemPath ||
          (currentPath?.includes("watch") && item.name === "Watch")
        ) {
          return item;
        }
        if (item.sub) {
          const activeSub = findActiveItem(item.sub);
          if (activeSub) return activeSub;
        }
      }
      return null;
    };

    const activeItem = findActiveItem(itemsWithWatch);

    return {
      itemsWithWatch,
      activeItem,
    };
  }, [categories, currentPath]);

  return {
    categories: itemsWithWatch,
    activeItem,
  };
};