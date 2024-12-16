import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { IWriterRequest } from "@/types/writer-request.type";

const WriterRequestSchema = new Schema<IWriterRequest>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    brand_name: {
      type: String,
      required: true,
    },
    social_platforms: {
      type: [
        {
          platform: String,
          url: String,
        },
      ],
      required: true,
    },
    is_publisher: {
      type: Boolean,
      required: true,
    },
    is_freelancer: {
      type: Boolean,
      required: true,
    },
    will_upload_media: {
      type: Boolean,
      required: true,
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

WriterRequestSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

WriterRequestSchema.set("toJSON", {
  virtuals: true,
});

WriterRequestSchema.set("toObject", {
  virtuals: true,
});

WriterRequestSchema.plugin(mongooseLeanVirtuals);

const WriterRequestModel: Model<IWriterRequest> =
  models.WriterRequest ||
  model<IWriterRequest>("WriterRequest", WriterRequestSchema);

export default WriterRequestModel;
