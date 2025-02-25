import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { IPost } from "@/types/post.type";

const SourceSchema = new Schema(
  {
    id: {
      type: String,
    },
    url: {
      id: String,
    },
    name: {
      type: String,
    },
    icon: {
      type: String,
    },
    priority: {
      type: Number,
    },
  },
  { _id: true },
);

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    author_id: {
      type: String || Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    cluster_id: {
      type: String || undefined,
      default: undefined,
      index: true,
    },
    headline: {
      type: Boolean,
      default: false,
      index: true,
    },
    content: {
      type: String || null,
      default: null,
    },
    description: {
      type: String || null,
      default: null,
      index: true,
    },
    link: {
      type: String || null,
      unique: true,
      index: true,
      //   required: true,
    },
    image_url: {
      type: String || null,
      default: null,
    },
    video_url: {
      type: String || null,
      default: null,
    },
    ttr: {
      type: Number,
    },
    source: {
      id: {
        type: String || null,
      },
      name: {
        type: String || null,
      },
      url: {
        type: String || null,
      },
      icon: {
        type: String || null,
      },
      priority: {
        type: Number || null,
      },
    },
    keywords: {
      type: [String],
      default: [],
      index: true,
    },
    language: {
      type: String,
      default: "English",
      index: true,
    },
    country: {
      type: [String],
      default: ["Nigeria"],
      index: true,
    },
    category: {
      type: [String],
      required: true,
      index: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
    reactions: {
      like: {
        type: Number,
        default: 0,
      },
      dislike: {
        type: Number,
        default: 0,
      },
    },
    external: {
      type: Boolean,
      default: false,
    },
    top_feature: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "removed", "flagged"],
      default: "active",
    },
    published_at: {
      type: Date || String,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    id: false,
    autoIndex: true,
  },
);

PostSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

PostSchema.set("toObject", {
  virtuals: true,
});

PostSchema.plugin(mongooseLeanVirtuals);

const PostModel: Model<IPost> = models.Post || model<IPost>("Post", PostSchema);

export default PostModel;
