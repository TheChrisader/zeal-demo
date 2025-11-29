import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { IPageStats } from "@/types/page-stats.type";

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear().toString(); // Get full year
  const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Get month (0-11, add 1)
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const PageStatsSchema = new Schema<IPageStats>(
  {
    slug: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      default: getTodayDateString,
      validate: {
        validator: function(v: string) {
          // Validate YYYY-MM-DD format
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: 'Date must be in YYYY-MM-DD format'
      }
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
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

// Normal index for date
PageStatsSchema.index({ date: 1 });

// Compound index for slug, category and date (unique)
PageStatsSchema.index({ slug: 1, category: 1, date: 1 }, { unique: true });

PageStatsSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

PageStatsSchema.set("toJSON", {
  virtuals: true,
});

PageStatsSchema.set("toObject", {
  virtuals: true,
});

PageStatsSchema.plugin(mongooseLeanVirtuals);

const PageStatsModel: Model<IPageStats> =
  models.PageStats || model<IPageStats>("PageStats", PageStatsSchema);

export default PageStatsModel;