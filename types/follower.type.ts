import { Id } from "@/lib/database";

export interface IFollower {
  id?: Id | string;
  user_id: Id | string;
  follower_id: Id | string;
  created_at?: Date;
  updated_at?: Date;
}

export type TFollowers = IFollower[];
