import { revalidateTag } from "next/cache";
import { cacheManager } from "@/lib/cache";
import { connectToDatabase } from "@/lib/database";
import { IAdminSettings } from "@/types/admin-settings.type";
import AdminSettingsModel from "./admin-settings.model";

const CACHE_KEY = "admin_settings";
const CACHE_TAG = "admin_settings";

/**
 * Initializes the default admin settings if they don't exist.
 * Should be run once during application startup.
 */
export async function initializeAdminSettings(): Promise<void> {
  try {
    await connectToDatabase();
    const existingSettings = await AdminSettingsModel.findOne({
      uniqueIdentifier: "global_settings",
    });

    if (!existingSettings) {
      console.log("No admin settings found, creating defaults...");
      const defaultSettings = new AdminSettingsModel({
        uniqueIdentifier: "global_settings",
        // Add other essential default values based on your IAdminSettings definition
        // Example defaults (adjust according to your model):
        defaultUserRole: "user",
        requireEmailVerification: true,
        allowedAuthProviders: {
          google: false,
          github: false,
          emailPassword: true,
        },
        defaultPostStatus: "active",
        contentModeration: {},
        mediaUploadLimits: {
          maxImageSizeMB: 5,
          maxVideoSizeMB: 50,
          allowedImageFormats: ["jpg", "jpeg", "png", "gif", "webp"],
          allowedVideoFormats: ["mp4", "mov", "avi"],
        },
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: false,
        },
        mfaRequiredRoles: ["admin"],
        requireMfaForAllAdmins: false,
        sessionManagement: {
          userTimeoutMinutes: 60,
          adminTimeoutMinutes: 30,
          maxLoginAttempts: 5,
        },
        auditLogRetentionDays: 90,
        defaultLanguage: "English",
        maintenanceMode: {
          enabled: false,
          message: "Site is under maintenance.",
        },
        emailNotificationsEnabled: true,
        notificationEmailSettings: {},
        adminNotificationEmails: {},
        defaultNewsPreferences: [],
      });
      await defaultSettings.save();
      console.log("Default admin settings created successfully.");
    } else {
      console.log("Admin settings already initialized.");
    }
  } catch (error) {
    console.error("Error initializing admin settings:", error);
    // Consider more robust error handling or logging for production
  }
}

/**
 * Fetches the global admin settings from the database.
 * This is the core logic used by the cached version.
 * @returns {Promise<IAdminSettings | null>} The admin settings object or null if not found.
 */
const fetchAdminSettings = async (): Promise<IAdminSettings | null> => {
  console.log(`Fetching admin settings (cache key: ${CACHE_KEY})`);
  try {
    await connectToDatabase();
    const settings = await AdminSettingsModel.findOne({
      uniqueIdentifier: "global_settings",
    }).lean<IAdminSettings>();

    if (!settings) {
      console.warn("Admin settings not found in database.");
      return null;
    }
    return settings;
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    return null;
  }
};

/**
 * Retrieves the global admin settings, utilizing the cacheManager.
 * @returns {Promise<IAdminSettings | null>} The admin settings object or null if not found.
 */
export const getCachedAdminSettings =
  async (): Promise<IAdminSettings | null> => {
    return cacheManager<IAdminSettings | null>({
      key: CACHE_KEY,
      fetcher: fetchAdminSettings,
      tags: [CACHE_TAG],
      options: {
        revalidate: false, // Revalidate indefinitely, rely on manual invalidation via revalidateTag
      },
    });
  };

/**
 * Updates the global admin settings.
 * @param {Partial<IAdminSettings>} settingsData - The partial settings data to update.
 * @returns {Promise<IAdminSettings | null>} The updated admin settings object or null on failure.
 */
export async function updateAdminSettings(
  settingsData: Partial<IAdminSettings>,
): Promise<IAdminSettings | null> {
  try {
    await connectToDatabase();
    // Ensure uniqueIdentifier is not accidentally changed
    const updateData = { ...settingsData };
    delete updateData.uniqueIdentifier; // Prevent changing the identifier
    delete updateData._id; // Prevent changing the _id

    const updatedSettings = await AdminSettingsModel.findOneAndUpdate(
      { uniqueIdentifier: "global_settings" },
      { $set: updateData }, // Use $set to update only provided fields
      {
        new: true, // Return the updated document
        upsert: true, // Create if it doesn't exist (fallback)
        runValidators: true, // Ensure schema validation runs on update
      },
    ).lean<IAdminSettings>();

    if (updatedSettings) {
      // Invalidate the cache after successful update
      revalidateTag(CACHE_TAG);
      console.log(`Cache invalidated for tag: ${CACHE_TAG}`);
    }

    return updatedSettings;
  } catch (error) {
    console.error("Error updating admin settings:", error);
    return null;
  }
}
