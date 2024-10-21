import { Model, model, models, Schema } from "mongoose";

import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { IBookmark } from "@/types/bookmark.type";

const BookmarkSchema = new Schema<IBookmark>(
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

BookmarkSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

BookmarkSchema.set("toObject", {
  virtuals: true,
});

BookmarkSchema.plugin(mongooseLeanVirtuals);

const BookmarkModel: Model<IBookmark> =
  models.Bookmark || model<IBookmark>("Bookmark", BookmarkSchema);

export default BookmarkModel;
