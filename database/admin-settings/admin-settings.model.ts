import mongoose, { Model, model, models, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import {
  IAdminSettings,
  IContentModeration,
} from "@/types/admin-settings.type";
import { Languages } from "@/types/utils/language.type";

// Sub-schemas for nested objects
const PasswordPolicySchema = new Schema(
  {
    minLength: { type: Number, required: true },
    requireUppercase: { type: Boolean, required: true },
    requireLowercase: { type: Boolean, required: true },
    requireNumbers: { type: Boolean, required: true },
    requireSymbols: { type: Boolean, required: true },
    expiryDays: { type: Number },
  },
  { _id: false },
);

const SessionManagementSchema = new Schema(
  {
    userTimeoutMinutes: { type: Number, required: true },
    adminTimeoutMinutes: { type: Number, required: true },
    maxLoginAttempts: { type: Number, required: true, default: 5 }, // Added max login attempts
  },
  { _id: false },
);

const MediaUploadLimitsSchema = new Schema(
  {
    maxImageSizeMB: { type: Number, required: true },
    maxVideoSizeMB: { type: Number, required: true },
    allowedImageFormats: { type: [String], required: true },
    allowedVideoFormats: { type: [String], required: true },
  },
  { _id: false },
);

const RolePermissionSchema = new Schema(
  {
    roleName: { type: String, required: true },
    permissions: { type: [String], required: true },
  },
  { _id: false },
);

const AllowedAuthProvidersSchema = new Schema(
  {
    google: { type: Boolean, default: true },
    github: { type: Boolean, default: false },
    emailPassword: { type: Boolean, default: true },
  },
  { _id: false },
);

const ContentModerationSchema = new Schema<IContentModeration>(
  {
    flagThreshold: { type: Number },
    autoAction: { type: String, enum: ["remove", "review"] },
    allowBulkModeration: { type: Boolean, default: false }, // Added bulk moderation toggle
    autoFlagThreshold: { type: Number }, // Added auto-flag threshold
    requireInternalContentModeration: { type: Boolean, default: false }, // Added internal content moderation toggle
    requireScrapedContentModeration: { type: Boolean, default: false }, // Added scraped content moderation toggle
    requireUserGeneratedContentModeration: { type: Boolean, default: false }, // Added user-generated content moderation toggle
  },
  { _id: false },
);

const MaintenanceModeSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    message: { type: String, default: "Site is currently under maintenance." },
  },
  { _id: false },
);

const IntegrationSettingsSchema = new Schema(
  {
    enabled: { type: Boolean, required: true },
  },
  { _id: false },
);

// Sub-schema for Notification Email Settings
const NotificationEmailSettingsSchema = new Schema(
  {
    newUserRegistration: { type: Boolean, default: true },
    passwordResetRequest: { type: Boolean, default: true },
    postReported: { type: Boolean, default: true },
    // Add more specific notification types as needed
  },
  { _id: false },
);

// Sub-schema for Admin Notification Email Forwarding
const AdminNotificationEmailsSchema = new Schema(
  {
    defaultForwardingEmail: { type: String },
    specificNotificationEmails: {
      type: Map,
      of: [String], // Array of email addresses for each notification type
      default: {},
    },
  },
  { _id: false },
);

// Main Admin Settings Schema
const AdminSettingsSchema = new Schema<IAdminSettings>(
  {
    uniqueIdentifier: {
      type: String,
      unique: true,
      required: true,
      index: true,
      default: "global_settings",
    },
    // 1. User Management & Authentication
    defaultUserRole: { type: String, required: true, default: "user" },
    requireEmailVerification: { type: Boolean, required: true, default: true },
    allowedAuthProviders: {
      type: AllowedAuthProvidersSchema,
      required: true,
      default: {},
    },
    rolesAndPermissions: { type: [RolePermissionSchema], default: [] },

    // 2. Content Management (Posts)
    defaultPostStatus: {
      type: String,
      enum: ["active", "pending review"],
      required: true,
      default: "active",
    },
    availableCategories: { type: [String], default: [] },
    contentModeration: { type: ContentModerationSchema, default: {} },
    topFeatureRules: { type: String },
    mediaUploadLimits: {
      type: MediaUploadLimitsSchema,
      required: true,
      default: {
        maxImageSizeMB: 5,
        maxVideoSizeMB: 50,
        allowedImageFormats: ["jpg", "jpeg", "png", "gif", "webp"],
        allowedVideoFormats: ["mp4", "mov", "avi"],
      },
    },

    // 3. Security Settings
    passwordPolicy: {
      type: PasswordPolicySchema,
      required: true,
      default: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: false,
      },
    },
    mfaRequiredRoles: { type: [String], default: ["admin"] },
    requireMfaForAllAdmins: { type: Boolean, default: false }, // Added toggle for all admins MFA
    sessionManagement: {
      type: SessionManagementSchema,
      required: true,
      default: { userTimeoutMinutes: 60, adminTimeoutMinutes: 30 },
    },
    adminIpWhitelist: { type: [String], default: [] },
    auditLogRetentionDays: { type: Number, required: true, default: 90 },

    // 4. Application & Appearance
    defaultLanguage: {
      type: String,
      enum: Object.keys(Languages),
      required: true,
      default: "English",
    },
    maintenanceMode: {
      type: MaintenanceModeSchema,
      required: true,
      default: {},
    },
    adminNotificationEmails: {
      type: AdminNotificationEmailsSchema,
      required: true,
      default: {},
    },

    // 5. Notifications & Email
    emailNotificationsEnabled: { type: Boolean, default: true },
    notificationEmailSettings: {
      type: NotificationEmailSettingsSchema,
      required: true,
      default: {},
    },

    // 6. Preferences & Defaults
    defaultNewsPreferences: { type: [String], default: [] },
    defaultCountry: { type: String },

    // 7. Integrations
    integrationSettings: {
      type: Map,
      of: IntegrationSettingsSchema,
      default: {},
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    id: false,
    // Ensure only one settings document exists via the uniqueIdentifier field.
  },
);

AdminSettingsSchema.index({ uniqueIdentifier: 1 }, { unique: true });

// Add virtual 'id' field
AdminSettingsSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtuals are included in toObject/toJSON output
AdminSettingsSchema.set("toObject", { virtuals: true });
AdminSettingsSchema.set("toJSON", { virtuals: true });

// Plugin for lean queries
AdminSettingsSchema.plugin(mongooseLeanVirtuals);

console.log(mongoose.models);

// Create and export the model
const AdminSettingsModel: Model<IAdminSettings> =
  mongoose.models.AdminSettings ||
  mongoose.model<IAdminSettings>("AdminSettings", AdminSettingsSchema);

export default AdminSettingsModel;
