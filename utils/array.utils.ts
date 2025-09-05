/**
 * Randomly selects an item from an array
 * @param array - The array to select from
 * @returns A randomly selected item from the array, or undefined if array is empty
 */
export function getRandomItem<T>(array: T[]): T | undefined {
  if (array.length === 0) {
    return undefined;
  }

  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
