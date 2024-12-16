import { Document } from "mongoose";
import { Id } from "@/lib/database";

export interface IPermission extends Document {
  user_id: Id;
  permissions: string[];
  created_at: Date;
  updated_at: Date;
}

export type PermissionAction = "read" | "write" | "all";
export type PermissionResource =
  | "user"
  | "comment"
  | "post"
  | "permission"
  | "users"
  | "comments"
  | "posts"
  | "permissions"
  | "moderator"
  | "moderators"
  | "settings"
  | "admin";

export interface PermissionDTO {
  user_id: string;
  permissions: string[];
}
