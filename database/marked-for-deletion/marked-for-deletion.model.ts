import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import { Id } from "@/lib/database";
import {
  IMarkedForDeletion,
  MarkedEntryType,
} from "@/types/marked-for-deletion.type";

const MarkedForDeletionSchema = new Schema<IMarkedForDeletion>(
  {
    original_id: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    titleOrText: {
      type: String,
      required: true,
      trim: true,
    },
    entryType: {
      type: String,
      enum: Object.values(MarkedEntryType),
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model
      index: true,
    },
    // Option 1: Use a dedicated expiresAt field for TTL
    // expiresAt: {
    //   type: Date,
    //   // Automatically expire documents after 30 days from this date
    //   // This requires a TTL index on this field:
    //   // MarkedForDeletionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    //   // And you would set this field when creating a document.
    // },
  },
  {
    timestamps: {
      createdAt: "created_at", // Mongoose's default is also createdAt
      updatedAt: "updated_at", // Mongoose's default is also updatedAt
    },
    collection: "marked_for_deletion",
  },
);

// Option 2: Use createdAt for TTL (documents expire 30 days after creation)
// This is simpler if the expiry is always a fixed duration from creation.
MarkedForDeletionSchema.index(
  { created_at: -1 },
  //   { expireAfterSeconds: 30 * 24 * 60 * 60 },
); // 30 days

MarkedForDeletionSchema.virtual("id").get(function () {
  return (this._id as Id).toHexString();
});

MarkedForDeletionSchema.set("toObject", {
  virtuals: true,
});

MarkedForDeletionSchema.set("toJSON", {
  virtuals: true,
});

MarkedForDeletionSchema.plugin(mongooseLeanVirtuals);

const MarkedForDeletionModel: Model<IMarkedForDeletion> =
  models.MarkedForDeletion ||
  model<IMarkedForDeletion>("MarkedForDeletion", MarkedForDeletionSchema);

export default MarkedForDeletionModel;
