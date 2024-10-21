import { Categories } from "@/categories";

export const flattenCategories = (arr: Categories) => {
  const result: string[] = [];

  arr.forEach((item) => {
    if (item.path) {
      result.push(item.name);
    } else if (item.sub) {
      result.push(...flattenCategories(item.sub));
    }
  });

  return result;
};
