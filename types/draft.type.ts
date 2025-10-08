import { Id } from "@/lib/database";
import { Language } from "./utils/language.type";

export interface IDraft {
  _id?: Id;
  id: Id | string;
  user_id: Id | string;
  title: string;
  content: string;
  description: string;
  image_url: string | null;
  image_key?: string;
  image_metadata?: {
    x: number;
    y: number;
    scale: number;
    objectFit: "contain" | "cover" | "fill";
  };
  video_url: string | null;
  keywords: string[];
  language: Language;
  country: string[];
  category: string[];
  moderationStatus:
    | "draft"
    | "scheduled"
    | "awaiting_approval"
    | "published"
    | "rejected";
  moderationNotes: string[];
  published: boolean;
  scheduled_at?: Date | string; // When the draft is scheduled to be published
  isScheduled?: boolean; // Whether the draft is scheduled
  schedule_publish_type?: "automatic" | "manual"; // How the draft should be published when scheduled
  created_at: string;
  updated_at: string;
}
