import { Model, model, models, Schema } from "mongoose";

import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { IAnalytics } from "@/types/analytics.type";

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    userId: { type: String, required: true, index: true },
    postId: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    readAt: { type: Date, default: Date.now },
    timeSpent: { type: Number, default: 0 },
    readComplete: { type: Boolean, default: false },
    scrollDepth: { type: Number, default: 0 },
    lastPosition: { type: Number, default: 0 },
    bookmarked: { type: Boolean, default: false },
    interactions: {
      likeClicked: { type: Boolean, default: false },
      shareClicked: { type: Boolean, default: false },
      commentsMade: { type: Number, default: 0 },
      highlightCount: { type: Number, default: 0 },
    },
    readingSpeed: { type: Number },
    timeOfDay: { type: String },
    deviceType: { type: String },
    readingSession: { type: String },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    id: false,
  },
);

AnalyticsSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

AnalyticsSchema.set("toJSON", {
  virtuals: true,
});

AnalyticsSchema.set("toObject", {
  virtuals: true,
});

AnalyticsSchema.plugin(mongooseLeanVirtuals);

const AnalyticsModel: Model<IAnalytics> =
  models.Analytics || model<IAnalytics>("Analytics", AnalyticsSchema);

export default AnalyticsModel;
