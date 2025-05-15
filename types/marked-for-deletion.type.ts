import { Document } from "mongoose";
import { Id } from "@/lib/database";

export enum MarkedEntryType {
  POST = "post",
  COMMENT = "comment",
}

export interface IMarkedForDeletion extends Document {
  original_id: Id; // ID of the original post or comment
  titleOrText: string; // Title for posts, truncated text for comments
  entryType: MarkedEntryType;
  userId?: Id; // Optional: ID of the user who created the original entry
  created_at: Date;
  updated_at: Date;
  expires_at?: Date; // For TTL, if we decide to use a separate field
}

export interface MarkedForDeletionDTO {
  original_id: Id;
  titleOrText: string;
  entryType: MarkedEntryType;
  userId?: Id;
  expires_at?: Date; // Optional: if not provided, TTL might be based on createdAt
}
