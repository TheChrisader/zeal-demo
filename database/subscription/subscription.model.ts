import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { ISubscription } from "@/types/subscription.type";

const SubscriptionSchema = new Schema<ISubscription>(
  {
    endpoint: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expirationTime: {
      type: Number,
      default: null,
    },
    keys: {
      p256dh: {
        type: String,
        required: true,
      },
      auth: {
        type: String,
        required: true,
      },
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      sparse: true,
      index: true,
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

SubscriptionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

SubscriptionSchema.set("toJSON", {
  virtuals: true,
});

SubscriptionSchema.set("toObject", {
  virtuals: true,
});

SubscriptionSchema.plugin(mongooseLeanVirtuals);

const SubscriptionModel: Model<ISubscription> =
  models.Subscription ||
  model<ISubscription>("Subscription", SubscriptionSchema);

export default SubscriptionModel;
