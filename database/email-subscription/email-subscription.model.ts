import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import {
  EmailSubscriptionStatuses,
  IEmailSubscription,
} from "@/types/email-subscription.type";

const EmailSubscriptionSchema = new Schema<IEmailSubscription>(
  {
    subscriber_id: {
      type: Schema.Types.ObjectId,
      ref: "Subscriber",
      required: [true, "Subscriber ID is required."],
      index: true,
    },
    list_id: {
      type: String,
      required: [true, "List ID is required."],
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: EmailSubscriptionStatuses,
      default: "subscribed",
      index: true,
    },
    subscribed_at: {
      type: Date,
      default: Date.now,
    },
    unsubscribed_at: {
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

EmailSubscriptionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

EmailSubscriptionSchema.set("toObject", {
  virtuals: true,
});

EmailSubscriptionSchema.set("toJSON", {
  virtuals: true,
});

EmailSubscriptionSchema.plugin(mongooseLeanVirtuals);

// Add compound indexes for performance
EmailSubscriptionSchema.index(
  { subscriber_id: 1, list_id: 1 },
  { unique: true },
);
EmailSubscriptionSchema.index({ list_id: 1, status: 1 });
EmailSubscriptionSchema.index({ subscriber_id: 1, status: 1 });

const EmailSubscriptionModel: Model<IEmailSubscription> =
  models.EmailSubscription ||
  model("EmailSubscription", EmailSubscriptionSchema);

export default EmailSubscriptionModel;
