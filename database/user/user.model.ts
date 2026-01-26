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
    upgrade_pending: {
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
    referral_code: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    referral_count: {
      type: Number,
      default: 0,
    },
    referred_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    is_influencer: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Two-Factor Authentication fields
    two_fa_enabled: {
      type: Boolean,
      default: false,
    },
    two_fa_secret: {
      type: String,
      default: null,
      select: false, // Never query by default, must explicitly select
    },
    two_fa_backup_codes: {
      type: [String],
      default: [],
      select: false,
    },
    two_fa_backup_codes_used: {
      type: [String],
      default: [],
      select: false,
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

// Text index for search functionality
UserSchema.index({
  username: "text",
  display_name: "text",
  email: "text"
});

// Compound indexes for common query patterns
UserSchema.index({ role: 1, created_at: -1 });
UserSchema.index({ location: 1, created_at: -1 });
UserSchema.index({ has_email_verified: 1, created_at: -1 });
UserSchema.index({ auth_provider: 1, created_at: -1 });
UserSchema.index({ last_login_at: -1 });
UserSchema.index({ referral_code: 1 });
UserSchema.index({ referred_by: 1 });
UserSchema.index({ is_influencer: 1 });
UserSchema.index({ two_fa_enabled: 1 });

const UserModel: Model<IUserWithPassword> =
  models.User || model<IUserWithPassword>("User", UserSchema);

export default UserModel;
