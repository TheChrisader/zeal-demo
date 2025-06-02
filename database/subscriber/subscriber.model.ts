import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { ISubscriber } from "@/types/subscriber.type";

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    selectedCategories: {
      type: [String],
      default: [],
    },
    consentGivenAt: {
      type: Date,
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

const SubscriberModel: Model<ISubscriber> =
  models.Subscriber || model("Subscriber", SubscriberSchema);

export default SubscriberModel;
