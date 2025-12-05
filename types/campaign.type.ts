import { Document, Types } from "mongoose";
import { CATEGORIES } from "@/categories/flattened";

export const CampaignStatuses = [
  "draft",
  "sending",
  "completed",
  "failed",
] as const;

export type CampaignStatus = (typeof CampaignStatuses)[number];

export const CampaignTemplates = ["custom", "standard"] as const;
export type CampaignTemplate = (typeof CampaignTemplates)[number];

// Add 'ALL' to categories for segment options
export const CampaignSegments = [
  "ALL_BROADCAST",
  "ALL_NEWSLETTER",
  ...CATEGORIES,
] as const;
export type CampaignSegment = (typeof CampaignSegments)[number];

export interface ICampaignStats {
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
}

export interface ICampaignDataSnapshotMeta {
  subject: string;
  preheader?: string;
  unsubscribeUrl: string; // Will pass "{{UNSUBSCRIBE_URL}}" later
}

export interface ICampaignDataSnapshot {
  articles?: Types.ObjectId[];
  bodyContent?: string;
  meta: ICampaignDataSnapshotMeta;
}

export interface ICampaign extends Document<Types.ObjectId> {
  // --- 1. The Inputs (Editable State) ---
  internal_name: string;
  subject: string;
  preheader?: string;
  template_id: CampaignTemplate;
  segment: CampaignSegment;

  // We only store IDs here. The Admin UI populates the view using these.
  // Optional for custom templates
  articleIds?: Types.ObjectId[];

  // For custom templates - raw HTML content
  body_content?: string;

  // --- 2. The Snapshot (Frozen State) ---
  // When you click "Send", the system generates these.
  // The Sending Engine ONLY reads from here. It never looks at 'articleIds'.
  htmlSnapshot?: string;

  // We store the computed JSON data too, in case we need to re-render
  // with a new template design in the future.
  dataSnapshot?: ICampaignDataSnapshot;

  // --- 3. The Engine State ---
  status: CampaignStatus;

  // Cursor for the batcher. If the server crashes, we resume after this ID.
  lastProcessedId?: Types.ObjectId;

  started_at?: Date;
  completed_at?: Date;

  // --- 4. Analytics ---
  stats: ICampaignStats;

  created_at: Date;
  updated_at: Date;
}
