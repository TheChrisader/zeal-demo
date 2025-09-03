import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/database";
import {
  findModeratorById,
  updateModerator,
} from "@/database/moderator/moderator.repository";
import { hashPassword, verifyPassword } from "@/utils/password.utils";

// Validation schema for PATCH request
const updateModeratorSchema = z
  .object({
    name: z.string().min(1, "Name is required").optional(),
    currentPassword: z
      .string()
      .min(1, "Current password is required when changing password")
      .optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .optional(),
  })
  .refine(
    (data) => {
      // Must have at least name or (currentPassword and password)
      return !!data.name || (!!data.currentPassword && !!data.password);
    },
    {
      message: "Must provide either name or both currentPassword and password",
    },
  );

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();

    const moderator = await findModeratorById(params.id);

    if (!moderator) {
      return NextResponse.json(
        { message: "Moderator not found" },
        { status: 404 },
      );
    }

    // Return only the required fields
    const { name, email, password_hash, permissions } = moderator;

    return NextResponse.json({
      name,
      email,
      password: password_hash,
      permissions,
    });
  } catch (error) {
    console.error("Error fetching moderator:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();

    // Parse and validate request body
    const body = await req.json();
    const validation = updateModeratorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { name, currentPassword, password } = validation.data;

    // If password is being updated, verify current password
    if (password) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: "Current password is required when changing password" },
          { status: 400 },
        );
      }

      // Get current moderator to verify password
      const currentModerator = await findModeratorById(params.id);
      if (!currentModerator) {
        return NextResponse.json(
          { message: "Moderator not found" },
          { status: 404 },
        );
      }

      // Verify current password
      const isPasswordValid = await verifyPassword(
        currentPassword,
        currentModerator.password_hash,
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "Current password is incorrect" },
          { status: 401 },
        );
      }
    }

    // Prepare update data
    const updateData: Partial<{
      name: string;
      password_hash: string;
    }> = {};

    if (name) {
      updateData.name = name;
    }

    if (password) {
      updateData.password_hash = await hashPassword(password);
    }

    // Update moderator
    const updatedModerator = await updateModerator(params.id, updateData);

    if (!updatedModerator) {
      return NextResponse.json(
        { message: "Moderator not found" },
        { status: 404 },
      );
    }

    // Return updated fields
    const {
      name: updatedName,
      email,
      password_hash,
      permissions,
    } = updatedModerator;

    return NextResponse.json({
      name: updatedName,
      email,
      password: password_hash,
      permissions,
    });
  } catch (error) {
    console.error("Error updating moderator:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
