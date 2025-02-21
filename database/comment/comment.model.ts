import { Model, model, models, Schema } from "mongoose";

import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { IComment } from "@/types/comment.type";

const CommentSchema = new Schema<IComment>(
  {
    article_id: {
      type: Schema.Types.ObjectId,
      ref: "Post",
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
      maxlength: 2000,
    },
    parent_id: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    depth: {
      type: Number,
      default: 0,
      max: 10,
    },
    reply_count: {
      type: Number,
      default: 0,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    is_edited: {
      type: Boolean,
      default: false,
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

CommentSchema.index({ article_id: 1, created_at: -1 });
CommentSchema.index({ parent_id: 1, created_at: -1 });

const CommentModel: Model<IComment> =
  models.Comment || model<IComment>("Comment", CommentSchema);

export default CommentModel;
