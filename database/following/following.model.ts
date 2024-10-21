import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { IFollowing } from "@/types/following.type";

const FollowingSchema = new Schema<IFollowing>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    following_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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

FollowingSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

FollowingSchema.set("toObject", {
  virtuals: true,
});

FollowingSchema.plugin(mongooseLeanVirtuals);

const FollowingModel: Model<IFollowing> =
  models.Following || model<IFollowing>("Following", FollowingSchema);

export default FollowingModel;
