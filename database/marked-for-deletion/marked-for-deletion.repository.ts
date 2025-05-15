import { DeleteResult } from "mongodb";
import { Id, newId } from "@/lib/database";
import {
  IMarkedForDeletion,
  MarkedEntryType,
  MarkedForDeletionDTO,
} from "@/types/marked-for-deletion.type";
import MarkedForDeletionModel from "./marked-for-deletion.model";

/**
 * Creates a new entry in the marked_for_deletion collection.
 * @param dto - The data transfer object containing the details of the item to mark for deletion.
 * @returns The created marked for deletion entry.
 */
export const createMarkedForDeletionEntry = async (
  dto: MarkedForDeletionDTO,
): Promise<IMarkedForDeletion> => {
  try {
    const newEntry = new MarkedForDeletionModel({
      original_id: dto.original_id,
      titleOrText: dto.titleOrText,
      entryType: dto.entryType,
      userId: dto.userId, // Optional
      // expiresAt: dto.expiresAt, // Uncomment if using a dedicated expiresAt field
    });
    return await newEntry.save();
  } catch (error) {
    // It's good practice to log the error or handle it more specifically
    console.error("Error creating marked for deletion entry:", error);
    throw error;
  }
};

/**
 * Finds a marked for deletion entry by its original ID and type.
 * @param original_id - The ID of the original post or comment.
 * @param entryType - The type of the original entry (post or comment).
 * @returns The found entry, or null if not found.
 */
export const findMarkedEntryByOriginalId = async (
  original_id: string | Id,
  entryType: MarkedEntryType,
): Promise<IMarkedForDeletion | null> => {
  try {
    return await MarkedForDeletionModel.findOne({
      original_id: newId(original_id),
      entryType,
    }).lean();
  } catch (error) {
    console.error("Error finding marked entry by original ID:", error);
    throw error;
  }
};

/**
 * Deletes a marked for deletion entry by its own _id.
 * This might be used if an admin decides to permanently delete an item before its TTL expiry.
 * @param id - The _id of the marked_for_deletion document.
 * @returns The result of the delete operation.
 */
export const deleteMarkedEntryById = async (
  id: string | Id,
): Promise<DeleteResult> => {
  try {
    return await MarkedForDeletionModel.deleteOne({ _id: newId(id) });
  } catch (error) {
    console.error("Error deleting marked entry by ID:", error);
    throw error;
  }
};

/**
 * Retrieves all marked for deletion entries, optionally filtered by type.
 * @param entryType - Optional filter by entry type (post or comment).
 * @returns A list of marked for deletion entries.
 */
export const getAllMarkedEntries = async (
  entryType?: MarkedEntryType,
): Promise<IMarkedForDeletion[]> => {
  try {
    const filter = entryType ? { entryType } : {};
    return await MarkedForDeletionModel.find(filter).lean();
  } catch (error) {
    console.error("Error retrieving all marked entries:", error);
    throw error;
  }
};
