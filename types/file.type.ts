import { Id } from "@/lib/database";

export type ImageMimetype =
  | "image/png"
  | "image/jpeg"
  | "image/gif"
  | "image/webp";

export interface IFile {
  id: Id | string;
  original_name: string;
  custom_name: string;
  mimetype: string;
  extension?: string;
  size: number;
  key: string;
  created_at: Date;
  updated_at: Date | null;
  created_by: Id | string | null;
  updated_by: Id | string | null;
}

export type CreateLodgeFileDTO = Omit<
  IFile,
  "id" | "created_at" | "updated_at" | "updated_by"
>;
