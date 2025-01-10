import { unstable_cache } from "next/cache";

type CacheOptions = Parameters<typeof unstable_cache>[2];

interface CacheManagerOptions<T> {
  key: string | (() => string | Promise<string>);
  fetcher: () => Promise<T>;
  options?: CacheOptions;
  tags?: string[];
}

export async function cacheManager<T>(
  options: CacheManagerOptions<T>,
): Promise<T> {
  const { key, fetcher, options: cacheOptions, tags } = options;

  const cacheKey = typeof key === "function" ? await key() : key;

  try {
    return await unstable_cache(
      async () => {
        const data = await fetcher();
        return data;
      },
      [cacheKey],
      {
        ...cacheOptions,
        tags: tags,
      },
    )();
  } catch (error) {
    console.error(`Error in cacheWrapper for key "${cacheKey}":`, error);
    throw error;
  }
}
