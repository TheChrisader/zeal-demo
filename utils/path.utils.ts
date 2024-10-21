import Categories, { Category } from "@/categories";

export const getCategoryFromPath = (path: string) => {
  let category: Category | undefined = undefined;
  let subcategory: string | undefined = undefined;

  category = Categories.find(
    (item) =>
      item.path === path || item.sub?.find((subItem) => subItem.path === path),
  );

  if (category?.sub) {
    subcategory = category.sub.find((subItem) => subItem.path === path)?.name;
  }

  return [category?.name, subcategory];
};
