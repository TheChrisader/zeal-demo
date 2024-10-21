import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { UpdateUserAccountSchema } from "@/database/user/user.dto";
import { findUserById, updateUser } from "@/database/user/user.repository";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import {
  INTERNAL_ERROR,
  INVALID_INPUT_ERROR,
  USER_NOT_FOUND_ERROR,
} from "@/utils/error/error-codes";

export const GET = async () => {
  try {
    const { user } = await serverAuthGuard({ redirect: true });

    await connectToDatabase();

    const userData = await findUserById(user.id);

    if (!userData) {
      return sendError(
        buildError({
          code: USER_NOT_FOUND_ERROR,
          message: "User not found.",
          status: 404,
        }),
      );
    }

    return NextResponse.json(userData);
  } catch (error: unknown) {
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
