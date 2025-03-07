export type Category = {
  name: string;
  path?: string;
  sub?: Category[];
};

export type Categories = Category[];

const Categories: Categories = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "Breaking",
    path: "/breaking",
  },
  // {
  //   name: "Viral Videos",
  //   path: "/viral",
  // },
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
