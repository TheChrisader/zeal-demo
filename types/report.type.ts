import { Id } from "@/lib/database";

export interface IReport {
  post: Id;
  reporter: Id;
  reason:
    | "spam"
    | "harassment"
    | "violence"
    | "hate"
    | "misinformation"
    | "other";
  description?: string;
  status: "pending" | "resolved";
  moderatorNotes?: string;
  reviewedBy?: Id;
  reviewedAt?: Date;
  created_at: Date;
}
