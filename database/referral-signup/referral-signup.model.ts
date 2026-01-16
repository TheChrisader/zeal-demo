import { Model, model, models, Schema, Types } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

export interface IReferralSignup {
  id: string;
  user_id: Types.ObjectId;
  phone: string | null;
  source: string | null;
  promo_campaign: string;
  terms_accepted: boolean;
  signed_up_at: Date;
  created_at: Date;
  updated_at: Date;
}

const ReferralSignupSchema = new Schema<IReferralSignup>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    phone: {
      type: String,
      default: null,
    },
    source: {
      type: String,
      default: null,
    },
    promo_campaign: {
      type: String,
      default: "referral-promo-2",
    },
    terms_accepted: {
      type: Boolean,
      default: false,
    },
    signed_up_at: {
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
  }
);

ReferralSignupSchema.virtual("id").get(function (this: IReferralSignup & { _id: Types.ObjectId }) {
  return this._id.toHexString();
});

ReferralSignupSchema.set("toObject", {
  virtuals: true,
});

ReferralSignupSchema.set("toJSON", {
  virtuals: true,
});

ReferralSignupSchema.plugin(mongooseLeanVirtuals);

const ReferralSignupModel: Model<IReferralSignup> =
  models.ReferralSignup || model("ReferralSignup", ReferralSignupSchema);

export default ReferralSignupModel;
