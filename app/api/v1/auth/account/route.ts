import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { UpdateUserAccountSchema } from "@/database/user/user.dto";
import { findUserById, updateUser } from "@/database/user/user.repository";
import { validateRequest } from "@/lib/auth/auth";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import {
  INTERNAL_ERROR,
  INVALID_INPUT_ERROR,
  USER_NOT_FOUND_ERROR,
} from "@/utils/error/error-codes";
import UserModel from "@/database/user/user.model";
import { transformUserForClient } from "@/utils/user.transform";

export const GET = async () => {
  try {
    await connectToDatabase();

    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    const userDoc = await UserModel.findById(user.id).select(
      "username email role display_name avatar bio country has_email_verified upgrade_pending referral_code referral_count referred_by",
    );

    if (!userDoc) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const userData = transformUserForClient(userDoc);
    return NextResponse.json(userData);
  } catch (error: unknown) {
    console.log(`Error getting user data: ${error}`);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
};

/**
 * Handles the PUT request to update the user account.
 *
 * @param {NextRequest} request - The request object containing the request details.
 * @return {Promise<NextResponse>} A promise that resolves to the updated user data in JSON format.
 */
export const PUT = async (request: NextRequest) => {
  try {
    const { user } = await serverAuthGuard();

    await connectToDatabase();

    const body = await request.json();

    const updateObject = UpdateUserAccountSchema.parse(body);

    const updatedUser = await updateUser(
      {
        id: user.id,
        ...updateObject,
      },
      { newDocument: true },
    );

    if (!updatedUser) {
      throw new Error("Something went wrong.");
    }

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return sendError(
        buildError({
          code: INVALID_INPUT_ERROR,
          message: "Invalid input.",
          status: 422,
          data: error as ZodError,
        }),
      );
    }
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
