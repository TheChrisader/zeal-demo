import { Model, model, models, Schema } from "mongoose";

import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { ILike } from "@/types/like.type";

const LikeSchema = new Schema<ILike>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    article_id: {
      type: Schema.Types.ObjectId,
      ref: "Post",
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

LikeSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

LikeSchema.set("toObject", {
  virtuals: true,
});

LikeSchema.plugin(mongooseLeanVirtuals);

const LikeModel: Model<ILike> = models.Like || model<ILike>("Like", LikeSchema);

export default LikeModel;
