import { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { IPost } from "@/types/post.type";

const SITEMAP_CACHE_TAG = "sitemap-data";
const SITEMAP_CACHE_KEY = "sitemap-entries";

type SitemapEntry = {
  url: string;
  lastModified: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
  alternates: {
    languages: {
      en: string;
      fr: string;
    };
  };
};

type CacheData = {
  articles: SitemapEntry[];
  lastGenerated: string;
  count: number;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL
  const baseUrl = "https://zealnews.africa";

  // Static routes with localization
  const staticRoutes = [
    "", // homepage
    "/news",
    "/news/local",
    "/news/across-africa",
    "/news/global",
    "/news/politics",
    "/news/climate",
    "/business",
    "/business/startup",
    "/business/economy-finance",
    "/business/crypto",
    "/business/career",
    "/technology",
    "/technology/latest-tech-news",
    "/technology/ai",
    "/technology/fintech",
    "/discovery",
    "/discovery/social-insight",
    "/discovery/culture",
    "/discovery/history",
    "/discovery/diaspora-connect",
    "/discovery/science",
    "/opinion",
    "/lifestyle",
    "/lifestyle/health",
    "/lifestyle/food",
    "/lifestyle/travel",
    "/lifestyle/parenting",
    "/lifestyle/fashion",
    "/entertainment",
    "/entertainment/celebrity-news",
    "/entertainment/profiles",
    "/entertainment/music",
    "/entertainment/movies",
    "/entertainment/sports",
    "/signin",
    "/signup",
    "/forgot-password",
    "/about-us",
    "/privacy-policy",
    "/terms-and-conditions",
    "/cookie-policy",
    "/newsletter/preferences",
  ];

  // Generate URLs for both English and French
  const urls: MetadataRoute.Sitemap = [];

  staticRoutes.forEach((route) => {
    // English version
    urls.push({
      url: `${baseUrl}/en${route}`,
      lastModified: new Date(),
      changeFrequency:
        route === ""
          ? "daily"
          : ["/signin", "/signup", "/forgot-password"].includes(route)
            ? "monthly"
            : [
                  "/about-us",
                  "/privacy-policy",
                  "/terms-and-conditions",
                  "/cookie-policy",
                ].includes(route)
              ? "yearly"
              : "daily",
      priority:
        route === ""
          ? 1
          : [
                "/news",
                "/business",
                "/technology",
                "/discovery",
                "/opinion",
                "/lifestyle",
                "/entertainment",
              ].some((cat) => route === `/${cat}`)
            ? 0.9
            : ["/about-us"].includes(route)
              ? 0.6
              : ["/signin", "/signup", "/newsletter/preferences"].includes(
                    route,
                  )
                ? 0.5
                : [
                      "/privacy-policy",
                      "/terms-and-conditions",
                      "/cookie-policy",
                    ].includes(route)
                  ? 0.4
                  : 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/en${route}`,
          fr: `${baseUrl}/fr${route}`,
        },
      },
    });

    // French version
    urls.push({
      url: `${baseUrl}/fr${route}`,
      lastModified: new Date(),
      changeFrequency:
        route === ""
          ? "daily"
          : ["/signin", "/signup", "/forgot-password"].includes(route)
            ? "monthly"
            : [
                  "/about-us",
                  "/privacy-policy",
                  "/terms-and-conditions",
                  "/cookie-policy",
                ].includes(route)
              ? "yearly"
              : "daily",
      priority:
        route === ""
          ? 1
          : [
                "/news",
                "/business",
                "/technology",
                "/discovery",
                "/opinion",
                "/lifestyle",
                "/entertainment",
              ].some((cat) => route === `/${cat}`)
            ? 0.9
            : ["/about-us"].includes(route)
              ? 0.6
              : ["/signin", "/signup", "/newsletter/preferences"].includes(
                    route,
                  )
                ? 0.5
                : [
                      "/privacy-policy",
                      "/terms-and-conditions",
                      "/cookie-policy",
                    ].includes(route)
                  ? 0.4
                  : 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/en${route}`,
          fr: `${baseUrl}/fr${route}`,
        },
      },
    });
  });

  try {
    const getCachedSitemapData: () => Promise<CacheData | null> =
      unstable_cache(
        async (): Promise<CacheData | null> => {
          return null;
        },
        [SITEMAP_CACHE_KEY],
        {
          revalidate: 1 * 24 * 60 * 60,
          tags: [SITEMAP_CACHE_TAG],
        },
      );

    const cachedData = await getCachedSitemapData();

    if (cachedData && cachedData.articles) {
      // Use cached data
      console.log(
        `Using cached sitemap data with ${cachedData.count} articles`,
      );
      urls.push(...cachedData.articles);
    } else {
      // Fallback: No cache available, fetch directly (this should rarely happen)
      console.log("No cached sitemap data found, using fallback fetch");

      // Import here to avoid loading when not needed
      const PostModel = (await import("@/database/post/post.model")).default;
      const { connectToDatabase } = await import("@/lib/database");

      await connectToDatabase();

      // Fetch all published posts in batches
      const BATCH_SIZE = 1000;
      let skip = 0;
      const articles: IPost[] = [];
      let hasMore = true;

      console.log("Fallback: Starting batch fetch of all articles...");

      while (hasMore) {
        const batch = await PostModel.find({
          published: true,
          status: "active",
        })
          .select("slug updated_at published_at")
          .sort({ published_at: -1 })
          .skip(skip)
          .limit(BATCH_SIZE)
          .lean()
          .exec();

        if (batch.length === 0) {
          hasMore = false;
        } else {
          articles.push(...batch);
          skip += BATCH_SIZE;
          console.log(
            `Fallback: Fetched batch, total so far: ${articles.length}`,
          );
        }
      }

      console.log(
        `Fallback: Complete, fetched total of ${articles.length} articles`,
      );

      // Add article URLs
      articles.forEach((article: IPost) => {
        const lastModified = new Date(
          article.updated_at || article.published_at,
        );

        // English version
        urls.push({
          url: `${baseUrl}/en/post/${article.slug}`,
          lastModified,
          changeFrequency: "never",
          priority: 0.7,
          alternates: {
            languages: {
              en: `${baseUrl}/en/post/${article.slug}`,
              fr: `${baseUrl}/fr/post/${article.slug}`,
            },
          },
        });

        // French version
        urls.push({
          url: `${baseUrl}/fr/post/${article.slug}`,
          lastModified,
          changeFrequency: "never",
          priority: 0.7,
          alternates: {
            languages: {
              en: `${baseUrl}/en/post/${article.slug}`,
              fr: `${baseUrl}/fr/post/${article.slug}`,
            },
          },
        });
      });

      console.log(`Fallback: Added ${articles.length} articles to sitemap`);
    }
  } catch (error) {
    console.error("Error in sitemap generation:", error);
    // Continue with static routes even if dynamic fetch fails
  }

  return urls;
}
