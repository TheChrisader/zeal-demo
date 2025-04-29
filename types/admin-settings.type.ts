import { Id } from "@/lib/database";
import { Language } from "./utils/language.type";

// Define types for complex fields
interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  expiryDays?: number; // Optional expiry
}

interface SessionManagement {
  userTimeoutMinutes: number;
  adminTimeoutMinutes: number;
  maxLoginAttempts: number; // Added max login attempts
}

// Removed EmailServerConfig - Credentials managed via ENV, settings below

// Interface for specific email notification toggles
interface NotificationEmailSettings {
  newUserRegistration?: boolean;
  passwordResetRequest?: boolean;
  postReported?: boolean;
  // Add more specific notification types as needed
}

// Interface for admin notification forwarding
interface AdminNotificationEmails {
  defaultForwardingEmail?: string; // Default email for all admin notifications
  specificNotificationEmails?: {
    newUserRegistration?: string[];
    passwordResetRequest?: string[];
    postReported?: string[];
    // Add more specific notification types mirroring NotificationEmailSettings
  };
}

export interface IContentModeration {
  flagThreshold?: number;
  autoAction?: "remove" | "review";
  allowBulkModeration?: boolean;
  autoFlagThreshold?: number;
  requireInternalContentModeration?: boolean; // Added
  requireScrapedContentModeration?: boolean; // Added
  requireUserGeneratedContentModeration?: boolean; // Added
}

interface MediaUploadLimits {
  maxImageSizeMB: number;
  maxVideoSizeMB: number;
  allowedImageFormats: string[]; // e.g., ['jpg', 'png', 'gif']
  allowedVideoFormats: string[]; // e.g., ['mp4', 'mov']
}

interface RolePermission {
  roleName: string;
  permissions: string[]; // List of permission identifiers
}

export interface IAdminSettings {
  _id?: Id; // Optional MongoDB ObjectId
  uniqueIdentifier: string; // Ensures only one settings document

  // 1. User Management & Authentication
  defaultUserRole: string;
  requireEmailVerification: boolean;
  allowedAuthProviders: {
    google: boolean;
    github: boolean;
    emailPassword: boolean;
  };
  rolesAndPermissions: RolePermission[]; // Array to manage roles and their permissions

  // 2. Content Management (Posts)
  defaultPostStatus: "active" | "pending review";
  availableCategories: string[]; // Global list of categories
  contentModeration: IContentModeration;
  topFeatureRules?: string; // Description or identifier for rules
  mediaUploadLimits: MediaUploadLimits;

  // 3. Security Settings
  passwordPolicy: PasswordPolicy;
  mfaRequiredRoles: string[]; // List of role names requiring MFA
  requireMfaForAllAdmins: boolean; // Added toggle for all admins MFA
  sessionManagement: SessionManagement;
  adminIpWhitelist?: string[]; // Optional list of allowed IPs/CIDRs
  auditLogRetentionDays: number;

  // 4. Application & Appearance
  defaultLanguage: Language;
  maintenanceMode: {
    enabled: boolean;
    message: string;
  };

  // 5. Notifications & Email
  emailNotificationsEnabled: boolean; // Master toggle for sending system emails
  notificationEmailSettings: NotificationEmailSettings; // Specific notification toggles
  adminNotificationEmails: AdminNotificationEmails; // Added admin email forwarding settings

  // 6. Preferences & Defaults
  defaultNewsPreferences: string[]; // List of default topic IDs or names
  defaultCountry?: string; // Optional default country code

  // 7. Integrations (API Keys managed via env vars as requested)
  integrationSettings?: {
    [serviceName: string]: { enabled: boolean }; // Simplified structure
  };

  // Timestamps
  created_at?: Date | string;
  updated_at?: Date | string;
}
