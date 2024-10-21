import { Id } from "@/lib/database";

export interface IFollowing {
  id: Id | string;
  user_id: Id | string;
  following_id: Id | string;
  created_at: Date;
  updated_at: Date;
}

export type TFollowings = IFollowing[];
