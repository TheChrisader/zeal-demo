import { User } from "lucia";
import { Document } from "mongoose";
import { Id } from "@/lib/database";

/**
 * Transform a MongoDB user document to the client-expected format
 * Converts _id to id and ensures proper property mapping
 */
export function transformUserForClient(userDoc: Document | null): User | null {
  if (!userDoc) return null;

  const userObject = userDoc.toObject();

  return {
    ...userObject,
    id: (userDoc._id as Id).toHexString(), // Convert ObjectId to string and map to 'id'
    _id: undefined, // Remove the MongoDB _id property
  } as User;
}

/**
 * Transform multiple user documents to client format
 */
export function transformUsersForClient(userDocs: Document[]): User[] {
  return userDocs
    .map(transformUserForClient)
    .filter((user): user is User => user !== null);
}

/**
 * Ensure a user object has the correct id property format
 * This can be used as a safety check for any user data
 */
export function normalizeUserId(user: User & { _id: Id }): User | null {
  if (!user) return null;

  // If already has id property and no _id, return as-is
  if (user.id && !user._id) return user;

  // If has _id but no id, convert _id to id
  if (user._id && !user.id) {
    return {
      ...user,
      id: typeof user._id === "object" ? user._id.toHexString() : user._id,
    };
  }

  // If has both, prefer id and remove _id
  if (user.id && user._id) {
    const { _id, ...userWithoutId } = user;
    return userWithoutId;
  }

  return user;
}
