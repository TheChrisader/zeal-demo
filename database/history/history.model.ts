import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { IHistory } from "@/types/history.type";

const HistorySchema = new Schema<IHistory>(
  {
    date: {
      type: String,
      required: true,
      index: true,
    },
    year: {
      type: String,
      required: true,
    },
    event: {
      type: String,
      required: true,
      index: true,
      unique: true,
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

HistorySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

HistorySchema.set("toObject", {
  virtuals: true,
});

HistorySchema.set("toJSON", {
  virtuals: true,
});

HistorySchema.plugin(mongooseLeanVirtuals);

const HistoryModel: Model<IHistory> =
  models.History || model<IHistory>("History", HistorySchema);

export default HistoryModel;
