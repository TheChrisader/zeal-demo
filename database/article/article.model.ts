import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { IArticle } from "@/types/article.type";

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

const ArticleSchema = new Schema<IArticle>(
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
    image_key: {
      type: String,
    },
    image_metadata: {
      x: {
        type: Number,
      },
      y: {
        type: Number,
      },
      scale: {
        type: Number,
      },
      objectFit: {
        type: String,
        enum: ["contain", "cover", "fill"],
      },
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
    short_url: {
      type: String,
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
    generatedBy: {
      type: String,
      enum: ["auto", "user", "zeal"],
      required: true,
    },
    draft_id: {
      type: Schema.Types.ObjectId,
      ref: "Draft",
    },
    shouldShowCTA: {
      type: Boolean,
      default: false,
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
  },
);

// Indexes
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ published_at: -1 });
ArticleSchema.index({ top_feature: -1 });
ArticleSchema.index({ created_at: -1 });
ArticleSchema.index({ author_id: -1 });
ArticleSchema.index({ draft_id: 1 });
ArticleSchema.index({ short_url: 1 }, { sparse: true });

// Compound indexes
ArticleSchema.index({ keywords: 1, published_at: -1 });
ArticleSchema.index({ status: 1, published_at: -1 });
ArticleSchema.index({ category: 1, published_at: -1 });
ArticleSchema.index({ category: 1, created_at: -1 });
ArticleSchema.index({ generatedBy: 1, published_at: -1 });
ArticleSchema.index({ title: "text", published_at: -1 });

ArticleSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

ArticleSchema.set("toObject", {
  virtuals: true,
});

ArticleSchema.plugin(mongooseLeanVirtuals);

const ArticleModel: Model<IArticle> = models.Article || model<IArticle>("Article", ArticleSchema);

export default ArticleModel;
