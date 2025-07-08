export type Category = {
  name: string;
  path?: string;
  sub?: Category[];
};

export type Categories = Category[];

export const categoryMap: Record<string, string[]> = {
  Local: ["Headlines", "Zeal Headline News", "Local"],
  "Across Africa": [
    "Top West African News",
    "Top East African News",
    "Top Southern Africa News",
    "Across Africa",
  ],
  Global: [
    "Top US News",
    "UK Top News",
    "EU News",
    "Asian News",
    "Zeal Global",
    "Global",
  ],
  Politics: ["Politics"],
  Climate: ["Weather", "Climate"],
  Startup: ["Startup News", "Startup"],
  "Economy/Finance": [
    "Economy",
    "Personal Finance",
    "Market Watch",
    "Business 360",
    "Economy/Finance",
  ],
  Crypto: ["Crypto"],
  Career: [
    "Latest Job News",
    "Career Tips",
    "Top Global Jobs",
    "Entrepreneurship",
    "Career",
  ],
  "Latest Tech News": [
    "Latest Tech News",
    "Cartech",
    "Gadgets Buying Guide",
    "Gaming",
    "Zeal Tech",
  ],
  Fintech: ["Fintech"],
  AI: ["Artificial Intelligence", "AI"],
  "Social Insight": ["Social Insight"],
  // Culture: ["Culture"],
  // History: ["History"],
  // "Diaspora Connect": ["Diaspora Connect"],
  // Science: ["Science"],
  Health: ["Health News", "Zeal Lifestyle", "Health"],
  Food: ["Food & Nutrition", "Food"],
  Travel: ["Travel & Tourism", "Travel"],
  Parenting: ["Family & Parenting", "Parenting"],
  Fashion: ["Style & Beauty", "Fashion"],
  "Celebrity News": ["Celebrity News"],
  Profiles: ["Hot Interviews", "Zeal Entertainment", "Profiles"],
  Music: ["Trending Music", "Music"],
  Movies: ["Top Movies", "Movies"],
  Sports: ["Top Sports News", "Sports", "UK Premiership", "Basketball"],
};

export const topLevelCategoryMap: Record<string, string[]> = {
  News: ["Local", "Across Africa", "Global", "Politics", "Climate"],
  Business: ["Startup", "Economy/Finance", "Crypto", "Career"],
  Technology: ["Latest Tech News", "Fintech", "AI"],
  Discovery: [
    "Social Insight",
    // "Culture",
    // "History",
    // "Diaspora Connect",
    // "Science",
  ],
  Lifestyle: ["Health", "Food", "Travel", "Parenting", "Fashion"],
  Entertainment: ["Celebrity News", "Profiles", "Music", "Movies", "Sports"],
};

export const getTopLevelCategoryList = (
  category: keyof typeof topLevelCategoryMap,
) => {
  const listsToIterate = topLevelCategoryMap[category];

  if (!listsToIterate) {
    const subCategory = categoryMap[category];

    if (!subCategory) {
      return [category];
    }

    return subCategory;
  }

  return listsToIterate!.map((list) => categoryMap[list]!).flat();
};

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
      // {
      //   name: "Culture",
      //   path: "/culture",
      // },
      // {
      //   name: "History",
      //   path: "/history",
      // },
      // {
      //   name: "Diaspora Connect",
      //   path: "/diaspora-connect",
      // },
      // {
      //   name: "Science",
      //   path: "/science",
      // },
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
    console.log(category.path, searchPath);
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
  .filter((category) => category !== "News");

const Categoriess: Categories = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "Breaking",
    path: "/breaking",
  },
  {
    name: "Viral Videos",
    path: "/videos",
  },
  {
    name: "Local News",
    sub: [
      {
        name: "Politics",
        path: "/politics",
      },
      {
        name: "Headlines",
        path: "/zeal-news-headlines",
      },
      {
        name: "Weather",
        path: "/weather",
      },
    ],
  },
  {
    name: "African News",
    sub: [
      {
        name: "Top West African News",
        path: "/top-west-african-news",
      },
      {
        name: "Top East African News",
        path: "/top-east-african-news",
      },
      {
        name: "Top Southern Africa News",
        path: "/top-southern-africa-news",
      },
    ],
  },
  {
    name: "Global News",
    sub: [
      { name: "Zeal Global", path: "/zeal-global" },
      {
        name: "Top US News",
        path: "/us-news",
      },
      {
        name: "UK Top News",
        path: "/uk-news",
      },
      {
        name: "EU News",
        path: "/eu-news",
      },
      {
        name: "Asian News",
        path: "/asian-news",
      },
    ],
  },
  {
    name: "Entertainment",
    sub: [
      { name: "Zeal Entertainment", path: "/zeal-entertainment" },
      {
        name: "Celebrity News",
        path: "/celebrity-news",
      },
      {
        name: "Top Movies",
        path: "/top-movies",
      },
      {
        name: "Trending Music",
        path: "/trending-music",
      },
      {
        name: "Hot Interviews",
        path: "/hot-interviews",
      },
    ],
  },
  {
    name: "Business",
    sub: [
      { name: "Business 360", path: "/business-360" },
      {
        name: "Economy",
        path: "/economy",
      },
      {
        name: "Personal Finance",
        path: "/personal-finance",
      },
      {
        name: "Market Watch",
        path: "/market-watch",
      },
      {
        name: "Startup News",
        path: "/startup-news",
      },
      {
        name: "Entrepreneurship",
        path: "/entrepreneurship",
      },
      {
        name: "E-Commerce",
        path: "/e-commerce",
      },
    ],
  },
  {
    name: "Technology",
    sub: [
      { name: "Zeal Tech", path: "/zeal-tech" },
      {
        name: "Latest Tech News",
        path: "/latest-tech-news",
      },
      { name: "Artificial Intelligence", path: "/artificial-intelligence" },
      {
        name: "Crypto",
        path: "/crypto",
      },
      {
        name: "Fintech",
        path: "/fintech",
      },
      {
        name: "Cartech",
        path: "/cartech",
      },
      {
        name: "Gadgets Buying Guide",
        path: "/gadgets",
      },
    ],
  },
  {
    name: "Lifestyle",
    sub: [
      { name: "Zeal Lifestyle", path: "/zeal-lifestyle" },
      {
        name: "Health News",
        path: "/health-news",
      },
      {
        name: "Food & Nutrition",
        path: "/food-nutrition",
      },
      {
        name: "Travel & Tourism",
        path: "/travel-tourism",
      },
      {
        name: "Style & Beauty",
        path: "/style-beauty",
      },
      {
        name: "Family & Parenting",
        path: "/family-parenting",
      },
    ],
  },
  {
    name: "Sports",
    sub: [
      { name: "Zeal Sports", path: "/zeal-sports" },
      {
        name: "Top Sports News",
        path: "/top-sports-news",
      },
      {
        name: "UK Premiership",
        path: "/uk-premiership",
      },
      {
        name: "Basketball",
        path: "/basketball",
      },
      {
        name: "Gaming",
        path: "/gaming",
      },
    ],
  },
  {
    name: "Career / Jobs",
    sub: [
      {
        name: "Latest Job News",
        path: "/latest-job-news",
      },
      {
        name: "Career Tips",
        path: "/career-tips",
      },
      {
        name: "Top Global Jobs",
        path: "/top-global-jobs",
      },
    ],
  },
];

export default Categories;
