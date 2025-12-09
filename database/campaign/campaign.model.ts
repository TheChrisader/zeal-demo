import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import {
  CampaignSegments,
  CampaignStatuses,
  CampaignTemplates,
  ICampaign,
  ICampaignDataSnapshot,
  ICampaignDataSnapshotMeta,
  ICampaignStats,
} from "@/types/campaign.type";

const CampaignStatsSchema = new Schema<ICampaignStats>(
  {
    sent: {
      type: Number,
      default: 0,
      min: 0,
    },
    opened: {
      type: Number,
      default: 0,
      min: 0,
    },
    clicked: {
      type: Number,
      default: 0,
      min: 0,
    },
    bounced: {
      type: Number,
      default: 0,
      min: 0,
    },
    unsubscribed: {
      type: Number,
      default: 0,
      min: 0,
    },
    complained: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
);

const CampaignDataSnapshotMetaSchema = new Schema<ICampaignDataSnapshotMeta>(
  {
    subject: {
      type: String,
      required: true,
    },
    preheader: {
      type: String,
    },
    unsubscribeUrl: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const CampaignDataSnapshotSchema = new Schema<ICampaignDataSnapshot>(
  {
    articles: {
      type: [Schema.Types.ObjectId],
      ref: "Post",
      default: undefined,
    },
    bodyContent: {
      type: String,
      default: undefined,
    },
    meta: {
      type: CampaignDataSnapshotMetaSchema,
      required: true,
    },
  },
  { _id: false },
);

const CampaignSchema = new Schema<ICampaign>(
  {
    // --- 1. The Inputs (Editable State) ---
    internal_name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    preheader: {
      type: String,
      trim: true,
    },
    template_id: {
      type: String,
      enum: CampaignTemplates,
      default: "standard",
      index: true,
    },
    segment: {
      type: String,
      enum: CampaignSegments,
      default: "ALL_SUBSCRIBERS",
      index: true,
    },

    // We only store IDs here. The Admin UI populates the view using these.
    // Optional for custom templates.
    articleIds: {
      type: [Schema.Types.ObjectId],
      ref: "Post",
      default: undefined,
      index: true,
    },

    // For custom templates - raw HTML content
    body_content: {
      type: String,
      default: undefined,
    },

    // --- 2. The Snapshot (Frozen State) ---
    // When you click "Send", the system generates these.
    // The Sending Engine ONLY reads from here. It never looks at 'articleIds'.
    htmlSnapshot: {
      type: String,
    },

    snapshotPlaintext: {
      type: String,
    },

    // We store the computed JSON data too, in case we need to re-render
    // with a new template design in the future.
    dataSnapshot: {
      type: CampaignDataSnapshotSchema,
    },

    // --- 3. The Engine State ---
    status: {
      type: String,
      enum: CampaignStatuses,
      default: "draft",
      index: true,
    },

    // Cursor for the batcher. If the server crashes, we resume after this ID.
    lastProcessedId: {
      type: Schema.Types.ObjectId,
      ref: "Subscriber",
      sparse: true,
    },

    lastProcessedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },

    started_at: {
      type: Date,
    },
    completed_at: {
      type: Date,
    },

    // --- 4. Analytics ---
    stats: {
      type: CampaignStatsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    id: false,
  },
);

// Indexes
CampaignSchema.index({ status: 1, created_at: -1 });
CampaignSchema.index({ status: 1, started_at: -1 });
CampaignSchema.index({ subject: "text" });
CampaignSchema.index({ internal_name: "text" });
CampaignSchema.index({ lastProcessedId: 1 }, { sparse: true });
CampaignSchema.index({ lastProcessedUserId: 1 }, { sparse: true });
CampaignSchema.index({ started_at: -1 });
CampaignSchema.index({ completed_at: -1 });
CampaignSchema.index({ template_id: 1 });
CampaignSchema.index({ segment: 1 });

// Compound indexes
CampaignSchema.index({ status: 1, articleIds: 1 });
CampaignSchema.index({ status: 1, started_at: -1, completed_at: -1 });
CampaignSchema.index({ status: 1, template_id: 1, segment: 1 });
CampaignSchema.index({ template_id: 1, segment: 1, created_at: -1 });

CampaignSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

CampaignSchema.set("toObject", {
  virtuals: true,
});

CampaignSchema.set("toJSON", {
  virtuals: true,
});

CampaignSchema.plugin(mongooseLeanVirtuals);

const CampaignModel: Model<ICampaign> =
  models.Campaign || model("Campaign", CampaignSchema);

export default CampaignModel;
