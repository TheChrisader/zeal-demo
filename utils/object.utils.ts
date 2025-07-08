/**
 * Deduplicates an array of objects based on a specified key.
 * It preserves the order of the first occurrence of each unique item.
 * NOTE: This works best when the key's value is a primitive (string, number).
 * For object keys (like a Mongoose ObjectId), use a custom function or see the example below.
 *
 * @param items The array of objects to deduplicate.
 * @param key The key of the object (e.g., 'id', 'email') to use for uniqueness.
 * @returns A new array with duplicate objects removed.
 */
export function deduplicateByKey<T extends object>(
  items: T[],
  key: keyof T,
): T[] {
  const uniqueMap = new Map<T[typeof key], T>();

  for (const item of items) {
    const identifier = item[key];
    if (!uniqueMap.has(identifier)) {
      uniqueMap.set(identifier, item);
    }
  }

  return Array.from(uniqueMap.values());
}
