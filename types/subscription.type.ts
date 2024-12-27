import { Id } from "@/lib/database";

export interface ISubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
  user_id?: Id;
}
