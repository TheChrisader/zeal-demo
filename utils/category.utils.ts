import Categories, {
  Category,
  TOP_LEVEL_CATEGORIES_LIST,
  TopLevelCategory,
} from "@/categories";

export const flattenCategories = (arr: Category[]) => {
  const result: string[] = [];

  arr.forEach((item) => {
    if (item.sub) {
      result.push(...flattenCategories(item.sub!));
    } else {
      result.push(item.name);
    }
  });

  return result.filter((item) => item !== "Home");
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
