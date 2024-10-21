import { Id } from "@/lib/database";

export interface IDraft {
  id: Id | string;
  user_id: Id | string;
  title: string;
  content_hash: string;
  category: string[];
  keywords: string[];
  description: string;
  country: string[];
  language: string[];
  image_url: string;
  video_url: string;
  created_at: Date;
  updated_at: Date;
}
