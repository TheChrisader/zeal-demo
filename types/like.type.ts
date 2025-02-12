import { Id } from "@/lib/database";

export interface ILike {
  id: Id | string;
  user_id: Id | string;
  article_id: Id | string;
  created_at: Date;
  updated_at: Date;
}
