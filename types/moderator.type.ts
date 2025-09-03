import { Document } from "mongoose";
import { Id } from "@/lib/database";

export interface IModerator extends Document {
  _id: Id;
  name: string;
  email: string;
  password_hash: string;
  permissions: string[];
  created_at: Date;
  updated_at: Date;
}

export interface ModeratorDTO {
  name: string;
  email: string;
  password_hash: string;
  permissions: string[];
}
