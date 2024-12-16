import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { IReport } from "@/types/report.type";

const ReportSchema = new Schema<IReport>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "spam",
        "harassment",
        "violence",
        "hate",
        "misinformation",
        "other",
      ],
      required: true,
      index: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
      index: true,
    },
    moderatorNotes: {
      type: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
      default: Date.now,
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

ReportSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

ReportSchema.set("toJSON", {
  virtuals: true,
});

ReportSchema.set("toObject", {
  virtuals: true,
});

ReportSchema.plugin(mongooseLeanVirtuals);

const ReportModel: Model<IReport> =
  models.Report || model<IReport>("Report", ReportSchema);

export default ReportModel;
