import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { ISubscriber, SubscriberStatuses } from "@/types/subscriber.type";

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email_address: {
      type: String,
      required: [true, "Email address is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    global_status: {
      type: String,
      enum: SubscriberStatuses,
      default: "active",
      index: true,
    },
    status_reason: {
      type: String,
      trim: true,
    },
    status_updated_at: {
      type: Date,
      default: Date.now,
    },
    is_verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verification_token: {
      type: String,
      sparse: true,
      index: true,
    },
    verified_at: {
      type: Date,
    },
    soft_bounce_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    last_soft_bounce_at: {
      type: Date,
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

SubscriberSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

SubscriberSchema.set("toObject", {
  virtuals: true,
});

SubscriberSchema.set("toJSON", {
  virtuals: true,
});

SubscriberSchema.plugin(mongooseLeanVirtuals);

// Add compound indexes for performance
SubscriberSchema.index({ global_status: 1, created_at: -1 });

const SubscriberModel: Model<ISubscriber> =
  models.Subscriber || model("Subscriber", SubscriberSchema);

export default SubscriberModel;
