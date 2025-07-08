import Categories, { Category } from "@/categories";

const deepClone = <T>(obj: T) => JSON.parse(JSON.stringify(obj));

export const getCategoryFromPath = (path: string) => {
  let category: Category | undefined = undefined;
  let subcategory: string | undefined = undefined;

  // const index = Categories.findIndex((item) => item.name === "Local News");
  const cats: Category[] = deepClone(Categories);
  // cats[index]!.sub![1]!.name = "Zeal Headline News";

  category = cats.find(
    (item) =>
      item.path === path || item.sub?.find((subItem) => subItem.path === path),
  );

  if (category?.sub) {
    subcategory = category.sub.find((subItem) => subItem.path === path)?.name;
  }

  if (subcategory === "Headlines") {
    subcategory = "Zeal Headline News";
  }
  console.log(category?.name, subcategory);

  return [category?.name, subcategory];
};
