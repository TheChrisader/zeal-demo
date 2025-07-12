export type Category = {
  name: string;
  path?: string;
  sub?: Category[];
};

export type Categories = Category[];

export const topLevelCategoryMap: Record<string, string[]> = {
  News: ["Local", "Across Africa", "Global", "Politics", "Climate"],
  Business: ["Startup", "Economy/Finance", "Crypto", "Career"],
  Technology: ["Latest Tech News", "Fintech", "AI"],
  Discovery: [
    "Social Insight",
    "Culture",
    "History",
    "Diaspora Connect",
    "Science",
  ],
  Lifestyle: ["Health", "Food", "Travel", "Parenting", "Fashion"],
  Entertainment: ["Celebrity News", "Profiles", "Music", "Movies", "Sports"],
};

export const getTopLevelCategoryList = (
  category:
    | "News"
    | "Business"
    | "Technology"
    | "Discovery"
    | "Lifestyle"
    | "Entertainment",
) => {
  if (!topLevelCategoryMap[category]) {
    return [];
  }

  return topLevelCategoryMap[category];
};

export type TopLevelCategory =
  | "News"
  | "Business"
  | "Technology"
  | "Discovery"
  | "Lifestyle"
  | "Entertainment";

const Categories: Categories = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "News",
    path: "/news",
    sub: [
      {
        name: "Local",
        path: "/local",
      },
      {
        name: "Across Africa",
        path: "/across-africa",
      },
      {
        name: "Global",
        path: "/global",
      },
      {
        name: "Politics",
        path: "/politics",
      },
      {
        name: "Climate",
        path: "/climate",
      },
    ],
  },
  {
    name: "Business",
    path: "/business",
    sub: [
      {
        name: "Startup",
        path: "/startup",
      },
      {
        name: "Economy/Finance",
        path: "/economy-finance",
      },
      {
        name: "Crypto",
        path: "/crypto",
      },
      {
        name: "Career",
        path: "/career",
      },
    ],
  },
  {
    name: "Technology",
    path: "/technology",
    sub: [
      {
        name: "Latest Tech News",
        path: "/latest-tech-news",
      },
      {
        name: "AI",
        path: "/ai",
      },
      {
        name: "Fintech",
        path: "/fintech",
      },
    ],
  },
  {
    name: "Discovery",
    path: "/discovery",
    sub: [
      {
        name: "Social Insight",
        path: "/social-insight",
      },
      {
        name: "Culture",
        path: "/culture",
      },
      {
        name: "History",
        path: "/history",
      },
      {
        name: "Diaspora Connect",
        path: "/diaspora-connect",
      },
      {
        name: "Science",
        path: "/science",
      },
    ],
  },
  {
    name: "Lifestyle",
    path: "/lifestyle",
    sub: [
      {
        name: "Health",
        path: "/health",
      },
      {
        name: "Food",
        path: "/food",
      },
      {
        name: "Travel",
        path: "/travel",
      },
      {
        name: "Parenting",
        path: "/parenting",
      },
      {
        name: "Fashion",
        path: "/fashion",
      },
    ],
  },
  {
    name: "Entertainment",
    path: "/entertainment",
    sub: [
      {
        name: "Celebrity News",
        path: "/celebrity-news",
      },
      {
        name: "Profiles",
        path: "/profiles",
      },
      {
        name: "Music",
        path: "/music",
      },
      {
        name: "Movies",
        path: "/movies",
      },
      {
        name: "Sports",
        path: "/sports",
      },
    ],
  },
];
export function getCategoryByPath(
  searchPath: string,
  categories: typeof Categories = Categories,
): Category | undefined {
  if (!searchPath.includes("/")) {
    searchPath = "/" + searchPath;
  }
  // Iterate over the categories at the current level.
  for (const category of categories) {
    // 1. Check if the current category's path is an exact match.
    if (category.path === searchPath) {
      return category; // Found it!
    }

    // 2. If it's not a match, but it has sub-categories, search deeper.
    if (category.sub && category.sub.length > 0) {
      const foundInChildren = getCategoryByPath(searchPath, category.sub);
      // If the category was found in a child branch, return it immediately.
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }

  // 3. If the loop finishes, no match was found at this level or any sub-levels.
  return undefined;
}

export const extractPath = (
  name: string,
  categories: typeof Categories = Categories,
): string => {
  for (const category of categories) {
    if (name === category.name) {
      return category.path as string;
    }

    if (category.sub) {
      const subPath = extractPath(name, category.sub);
      if (subPath) {
        return category.path + subPath;
      }
    }
  }
  return "";
};

export const TOP_LEVEL_CATEGORIES = Categories.map((category) => category.name)
  .filter((category) => category !== "Home")
  .filter((category) => category !== "News") as TopLevelCategory[];

export default Categories;
