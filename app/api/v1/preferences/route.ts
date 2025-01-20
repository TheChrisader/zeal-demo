import { NextRequest, NextResponse } from "next/server";
import {
  getPreferencesByUserId,
  updatePreferences,
} from "@/database/preferences/preferences.repository";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import { INTERNAL_ERROR } from "@/utils/error/error-codes";

export const GET = async () => {
  try {
    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" });
    }

    const preferences = await getPreferencesByUserId(user.id);

    if (!preferences) {
      buildError({
        code: INTERNAL_ERROR,
        message: "Preferences not found",
        status: 404,
        data: null,
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    return sendError(
      buildError({
        code: INTERNAL_ERROR,
        message: error instanceof Error ? error.message : "An error occured.",
        status: 500,
        data: error,
      }),
    );
  }
};

export const PUT = async (request: NextRequest) => {
  try {
    const preferences = await request.json();
    if (!preferences) {
      return NextResponse.json({ message: "Preferences body cannot be empty" });
    }

    await connectToDatabase();

    const { user } = await serverAuthGuard();
    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" });
    }

    await updatePreferences(user.id, preferences);

    return NextResponse.json({ message: "Preferences updated" });
  } catch (error) {
    console.log(`Error updating preferences: ${error}`);
    return sendError(
      buildError({
        code: INTERNAL_ERROR,
        message: error instanceof Error ? error.message : "An error occured.",
        status: 500,
        data: error,
      }),
    );
  }
};
