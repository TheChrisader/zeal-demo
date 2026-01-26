import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import { Id } from "@/lib/database";
import { IInfluencer } from "@/types/referral.type";

const InfluencerStatuses = ["active", "inactive", "pending", "suspended"] as const;
type InfluencerStatus = (typeof InfluencerStatuses)[number];

const InfluencerSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: InfluencerStatuses,
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
      default: null,
    },
    joined_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    collection: "influencers",
  },
);

InfluencerSchema.virtual("id").get(function () {
  return (this._id as Id).toHexString();
});

InfluencerSchema.set("toObject", { virtuals: true });
InfluencerSchema.set("toJSON", { virtuals: true });
InfluencerSchema.plugin(mongooseLeanVirtuals);

const InfluencerModel: Model<IInfluencer> =
  models.Influencer || model<IInfluencer>("Influencer", InfluencerSchema);

export default InfluencerModel;
export { InfluencerStatuses, type InfluencerStatus };
