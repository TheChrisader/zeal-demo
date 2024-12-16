import { Id } from "@/lib/database";

export interface IComment {
  _id?: Id;
  id: Id | string;
  article_id: Id | string;
  user_id: Id | string;
  content: string;
  parent_id?: Id | string | null;
  depth: number;
  reply_count: number;
  is_deleted: boolean;
  is_edited: boolean;
  created_at: Date;
  updated_at: Date;
}
