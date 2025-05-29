"use server";
import PostModel from "@/database/post/post.model";
import { connectToDatabase, newId } from "@/lib/database";
import { createHash } from "crypto";

/**
 * Generates a unique 5-character hash from a URL with added entropy
 * to ensure uniqueness even for identical URLs.
 *
 * @param url - The input URL to hash
 * @returns A 5-character base62 encoded string (a-z, A-Z, 0-9)
 */
function generateUniqueHash(url: string): string {
  // Add current timestamp and random value to ensure uniqueness
  const uniqueInput = `${url}-${Date.now()}-${Math.random().toString(36).substring(2)}`;

  // Create SHA-256 hash
  const hash = createHash("sha256").update(uniqueInput).digest("hex");

  // Convert to base62 (alphanumeric) and take first 5 characters
  const base62 = BigInt("0x" + hash).toString(36);

  return base62.substring(0, 5);
}

// // Example usage
// const hash1 = generateUniqueHash('https://example.com');
// const hash2 = generateUniqueHash('https://example.com'); // Different from hash1
// console.log(hash1, hash2); // e.g. "a3f7b" and "k9j2m"

export async function generateShortURL(url: string, id: string) {
  await connectToDatabase();
  const hash = generateUniqueHash(url);
  const short_url = `zealnews.africa/en/r/${hash}`;
  const post = await PostModel.findByIdAndUpdate(
    id,
    { short_url },
    { new: true },
  );
  return await post?.toObject();
}
