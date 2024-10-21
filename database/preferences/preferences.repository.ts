import { Id } from "@/lib/database";

import { IPreferences } from "@/types/preferences.type";
import PreferencesModel from "./preferences.model";

export const createPreferences = async (
  preferences: Partial<IPreferences>,
): Promise<IPreferences | null> => {
  try {
    const newPreferences = await PreferencesModel.create(preferences);
    return newPreferences.toObject();
  } catch (error) {
    throw error;
  }
};

export const getPreferencesByUserId = async (
  userId: string | Id,
): Promise<IPreferences | null> => {
  try {
    const preferences = await PreferencesModel.findOne({ user_id: userId });
    return preferences?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

export const updatePreferences = async (
  user_id: string | Id,
  preferences: IPreferences,
): Promise<IPreferences | null> => {
  try {
    const updatedPreferences = await PreferencesModel.findOneAndUpdate(
      { _id: preferences.id, user_id },
      preferences,
      { new: true },
    );
    return updatedPreferences?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

export const deletePreferences = async (
  user_id: string | Id,
): Promise<IPreferences | null> => {
  try {
    const deletedPreferences = await PreferencesModel.findOneAndDelete({
      user_id,
    });
    return deletedPreferences?.toObject() || null;
  } catch (error) {
    throw error;
  }
};
