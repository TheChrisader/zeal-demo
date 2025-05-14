import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import { Id } from "@/lib/database";
import { IModerator } from "@/types/moderator.type";

const ModeratorSchema = new Schema<IModerator>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: {
        unique: true,
        collation: { locale: "en", strength: 2 },
      },
      lowercase: true,
      trim: true,
      // Basic email validation
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password_hash: {
      type: String,
      required: true,
    },
    permissions: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          // Validate permission format (resource:action)
          return v.every((permission) => /^[a-z_]+:[a-z_]+$/.test(permission));
        },
        message: "Permissions must follow format: resource:action",
      },
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    collection: "moderators",
  },
);

ModeratorSchema.virtual("id").get(function () {
  return (this._id as Id).toHexString();
});

ModeratorSchema.set("toObject", {
  virtuals: true,
});

ModeratorSchema.set("toJSON", {
  virtuals: true,
});

ModeratorSchema.plugin(mongooseLeanVirtuals);

const ModeratorModel: Model<IModerator> =
  models.Moderator || model<IModerator>("Moderator", ModeratorSchema);

export default ModeratorModel;
