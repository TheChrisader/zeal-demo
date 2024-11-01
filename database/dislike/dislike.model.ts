import { Model, model, models, Schema } from "mongoose";

import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { IDislike } from "@/types/dislike.type";

const DislikeSchema = new Schema<IDislike>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    article_id: {
      type: Schema.Types.ObjectId,
      ref: "Article",
      // type: String,
      required: true,
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

DislikeSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

DislikeSchema.set("toObject", {
  virtuals: true,
});

DislikeSchema.plugin(mongooseLeanVirtuals);

const DislikeModel: Model<IDislike> =
  models.Dislike || model<IDislike>("Dislike", DislikeSchema);

export default DislikeModel;
