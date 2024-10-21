import { Model, model, models, Schema } from "mongoose";

import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { IReaction } from "@/types/reaction.type";

const ReactionSchema = new Schema<IReaction>(
  {
    post_id: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    like: {
      type: Number,
      default: 0,
    },
    dislike: {
      type: Number,
      default: 0,
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

ReactionSchema.virtual("id").get(function () {
  return this._id;
});

ReactionSchema.set("toObject", {
  virtuals: true,
});

ReactionSchema.plugin(mongooseLeanVirtuals);

const ReactionModel: Model<IReaction> =
  models.Reaction || model<IReaction>("Reaction", ReactionSchema);

export default ReactionModel;
