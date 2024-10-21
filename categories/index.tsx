export type Category = {
  name: string;
  path?: string;
  sub?: Category[];
};

export type Categories = Category[];

const Categories: Categories = [
  {
    name: "For you",
    path: "/",
  },
  {
    name: "Breaking",
    path: "/breaking",
  },
  {
    name: "Viral Videos",
    path: "/viral",
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
        path: "/headlines",
      },
      {
        name: "Weather",
        path: "/weather",
      },
    ],
  },
  {
    name: "Global News",
    sub: [
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
