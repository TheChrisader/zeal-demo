import { unstable_cache } from "next/cache";

const CACHE_TTL = 1000 * 60 * 10;

function createTimedRandomGenerator(timeout: number) {
  let lastGeneratedValue: number | null = null;
  let lastGeneratedTime = 0;

  return function () {
    const currentTime = Date.now();

    if (
      lastGeneratedValue !== null &&
      currentTime - lastGeneratedTime < timeout
    ) {
      return lastGeneratedValue;
    }

    lastGeneratedValue = Math.random();
    lastGeneratedTime = currentTime;
    return lastGeneratedValue;
  };
}

const getCachedShuffler = () =>
  unstable_cache(
    async () => createTimedRandomGenerator(CACHE_TTL)(),
    ["cached-shuffler"],
    { revalidate: CACHE_TTL },
  )();

export async function shuffleArray<T>(array: T[]): Promise<T[]> {
  if (!array) return [];

  const shuffler = await getCachedShuffler();

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(shuffler * (i + 1));
    [array[i], array[j]] = [array[j]!, array[i]!];
  }
  return array;
}
