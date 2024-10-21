import { Id } from "@/lib/database";

export interface IReaction {
  id: Id | string;
  post_id: Id | string;
  like: number;
  dislike: number;
  created_at: Date;
  updated_at: Date;
}
