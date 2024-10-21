import { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import {
  AuthProviders,
  Genders,
  IUserWithPassword,
  UserRoles,
} from "@/types/user.type";

const UserSchema = new Schema<IUserWithPassword>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    has_email_verified: {
      type: Boolean,
      default: false,
    },
    password_hash: {
      type: String,
    },
    role: {
      type: String,
      enum: UserRoles,
      default: "user",
    },
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    bio: { type: String, default: null },
    avatar: { type: String, default: null },
    profile_banner: { type: String, default: null },
    auth_provider: {
      type: String,
      enum: AuthProviders,
      default: "email",
    },
    birth_date: {
      type: Date,
      default: null,
    },
    display_name: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: Genders,
      default: "unspecified",
    },
    is_disabled: {
      type: Boolean,
      default: false,
    },
    last_login_at: {
      type: Date,
      default: new Date(),
    },
    has_password: {
      type: Boolean,
      default: false,
    },
    is_creator: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      required: true,
    },
    ip_address: {
      type: String,
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

UserSchema.virtual("id").get(function getVirtualId() {
  return this._id.toHexString();
});

UserSchema.set("toObject", {
  virtuals: true,
});

UserSchema.plugin(mongooseLeanVirtuals);

const UserModel: Model<IUserWithPassword> =
  models.User || model<IUserWithPassword>("User", UserSchema);

export default UserModel;
