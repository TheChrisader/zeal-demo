import Categories, { Category } from "@/categories";

export const flattenCategories = (arr: Category[]) => {
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

export const findSiblings = (targetName: string): string[] => {
  if (targetName === "Zeal Headline News") {
    targetName = "Headlines";
  }

  for (const category of Categories) {
    if (category.sub) {
      const subNames = category.sub.map((sub) => sub.name);
      if (subNames.includes(targetName)) {
        return subNames.filter((name) => name !== targetName);
      }
    }
  }

  return [];
};
