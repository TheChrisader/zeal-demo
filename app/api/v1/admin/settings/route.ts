import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import {
  getCachedAdminSettings,
  updateAdminSettings,
} from "@/database/admin-settings/admin-settings.repository";
import { IAdminSettings } from "@/types/admin-settings.type";
// Optional: Import zod for validation if used in the project
// import { z } from 'zod';

// Optional: Define Zod schema for validation
// const adminSettingsUpdateSchema = z.object({ /* Define schema based on IAdminSettings, making fields optional */ });

export async function GET(request: NextRequest) {
  try {
    // No need to connect explicitly if repository functions handle it
    // await connectToDatabase();

    const settings = await getCachedAdminSettings();

    if (!settings) {
      // This might happen if initialization hasn't run or failed
      // Consider returning default settings or a specific error
      return NextResponse.json(
        { error: "Admin settings not found or not initialized." },
        { status: 404 },
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching admin settings [API]:", error);
    return NextResponse.json(
      { error: "Internal server error fetching settings." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Optional: Validate input using Zod
    // const validationResult = adminSettingsUpdateSchema.safeParse(body);
    // if (!validationResult.success) {
    //   return NextResponse.json({ error: "Invalid input data", details: validationResult.error.errors }, { status: 400 });
    // }
    // const validatedData = validationResult.data;

    // Use the raw body for now, relying on Mongoose validation in the repository
    const validatedData: Partial<IAdminSettings> = body;

    // No need to connect explicitly if repository functions handle it
    // await connectToDatabase();

    const updatedSettings = await updateAdminSettings(validatedData);

    if (!updatedSettings) {
      return NextResponse.json(
        { error: "Failed to update admin settings." },
        { status: 500 },
      );
    }

    // Cache invalidation happens within updateAdminSettings

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Error updating admin settings [API]:", error);
    // Handle potential JSON parsing errors or other issues
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error updating settings." },
      { status: 500 },
    );
  }
}
