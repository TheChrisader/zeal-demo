import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { IInstall } from "@/types/install.type";

const InstallSchema = new Schema<IInstall>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    eventType: {
      type: String,
      enum: ["prompt_shown", "prompt_accepted", "prompt_dismissed"],
      required: true,
    },
    deviceInfo: {
      platform: {
        type: String,
        required: true,
      },
      os: {
        type: String,
        required: true,
      },
      device: {
        type: String,
        required: true,
      },
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

InstallSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

InstallSchema.set("toObject", {
  virtuals: true,
});

InstallSchema.set("toJSON", {
  virtuals: true,
});

InstallSchema.plugin(mongooseLeanVirtuals);

const InstallModel: Model<IInstall> =
  models.Install || model<IInstall>("Install", InstallSchema);

export default InstallModel;
