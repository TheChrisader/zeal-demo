import { Id } from "@/lib/database";

export interface IComment {
  id: Id | string;
  article_id: Id | string;
  user_id: Id | string;
  content: string;
  parent_id: Id | string;
  replies: (Id | string)[];
  created_at: Date;
  updated_at: Date;
}
