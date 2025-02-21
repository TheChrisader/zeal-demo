import { Model, model, models, Schema } from "mongoose";

import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { IBatch } from "@/types/batch.type";

const BatchArticleSchema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    source_url: {
      type: String,
      required: true,
    },
    source_name: {
      type: String,
      required: true,
    },
    source_icon: {
      type: String,
      required: true,
    },
  },
  { _id: true },
);

const BatchSchema = new Schema<IBatch>(
  {
    name: { type: String, required: true, index: true, unique: true },
    summary: { type: String, default: null },
    related: { type: [Schema.Types.ObjectId], ref: "Batch", default: [] },
    articles: {
      type: [BatchArticleSchema],
      default: [],
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

BatchSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

BatchSchema.set("toJSON", {
  virtuals: true,
});

BatchSchema.set("toObject", {
  virtuals: true,
});

BatchSchema.plugin(mongooseLeanVirtuals);

const BatchModel: Model<IBatch> =
  models.Batch || model<IBatch>("Batch", BatchSchema);

export default BatchModel;
