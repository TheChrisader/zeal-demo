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
    content_hash: {
      type: String,
      required: true,
    },
    category: {
      type: [String],
      required: true,
    },
    keywords: {
      type: [String] || null,
      default: null,
    },
    description: {
      type: String || null,
      default: null,
    },
    country: {
      type: [String] || null,
      default: null,
    },
    language: {
      type: [String] || null,
      default: null,
    },
    image_url: {
      type: String || null,
      default: null,
    },
    video_url: {
      type: String || null,
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
