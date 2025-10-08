import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { IDraft } from "@/types/draft.type";

const DraftSchema = new Schema<IDraft>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    description: {
      type: String,
    },
    image_url: {
      type: String,
    },
    image_key: {
      type: String,
    },
    image_metadata: {
      x: {
        type: Number,
      },
      y: {
        type: Number,
      },
      scale: {
        type: Number,
      },
      objectFit: {
        type: String,
      },
    },
    video_url: {
      type: String,
    },
    category: {
      type: [String],
    },
    keywords: {
      type: [String],
      default: [],
    },
    country: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      default: "English",
    },
    published: {
      type: Boolean,
      default: false,
    },
    moderationStatus: {
      type: String,
      enum: [
        "draft",
        "scheduled",
        "awaiting_approval",
        "published",
        "rejected",
      ],
      default: "draft",
    },
    moderationNotes: {
      type: [String],
      default: [],
    },
    scheduled_at: {
      type: Date || String,
      default: null,
    },
    isScheduled: {
      type: Boolean,
      default: false,
    },
    schedule_publish_type: {
      type: String,
      enum: ["automatic", "manual"],
      default: null,
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

DraftSchema.index({ user_id: 1, created_at: -1 });
DraftSchema.index({ moderationStatus: 1 });
DraftSchema.index({ category: 1 });
DraftSchema.index({ created_at: -1 });
DraftSchema.index({ updated_at: -1 });
DraftSchema.index({ title: "text", description: "text" });
DraftSchema.index({
  isScheduled: 1,
  scheduled_at: 1,
  published: 1,
  moderationStatus: 1,
  schedule_publish_type: 1,
}); // For querying scheduled drafts

DraftSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

DraftSchema.set("toObject", {
  virtuals: true,
});

DraftSchema.plugin(mongooseLeanVirtuals);

const DraftModel: Model<IDraft> =
  models.Draft || model<IDraft>("Draft", DraftSchema);

export default DraftModel;
