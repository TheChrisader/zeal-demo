import { fetcher } from "@/lib/fetcher";

import { IPreferences } from "@/types/preferences.type";

export const getPreferences = async (): Promise<IPreferences> => {
  try {
    const data = await fetcher("/api/v1/preferences");
    return data;
  } catch (error) {
    throw error;
  }
};

export const updatePreferences = async (preferences: Partial<IPreferences>) => {
  try {
    const data = await fetcher("/api/v1/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};
