import { Model, model, models, Schema } from "mongoose";

import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { IComment } from "@/types/comment.type";

const CommentSchema = new Schema<IComment>(
  {
    article_id: {
      type: Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      index: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    parent_id: {
      type: Schema.Types.ObjectId || null,
      ref: "Comment",
      index: true,
    },
    replies: {
      type: [Schema.Types.ObjectId],
      ref: "Comment",
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

CommentSchema.virtual("id").get(function () {
  return this._id.toString();
});

CommentSchema.set("toObject", {
  virtuals: true,
});

CommentSchema.plugin(mongooseLeanVirtuals);

const CommentModel: Model<IComment> =
  models.Comment || model<IComment>("Comment", CommentSchema);

export default CommentModel;
