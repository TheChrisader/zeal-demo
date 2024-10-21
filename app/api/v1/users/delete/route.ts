import { NextRequest, NextResponse } from "next/server";
import { object, string, ZodError } from "zod";

import {
  deleteUserById,
  findUserById,
  //   findUserWithPasswordById,
} from "@/database/user/user.repository";
import { connectToDatabase } from "@/lib/database";

import { buildError, sendError } from "@/utils/error";
import {
  //   FORBIDDEN_ERROR,
  INTERNAL_ERROR,
  PASSWORD_REQUIRED_ERROR,
  USER_NOT_FOUND_ERROR,
  //   WRONG_PASSWORD_ERROR,
} from "@/utils/error/error-codes";

// TODO: add password validation
export const POST = async (request: NextRequest) => {
  try {
    await connectToDatabase();

    const deleteUserEmailSchema = object({ id: string().min(1, "Required.") });

    const body = await request.json();
    const { id } = deleteUserEmailSchema.parse(body);

    const userData = findUserById(id);

    if (!userData) {
      return sendError(
        buildError({
          code: USER_NOT_FOUND_ERROR,
          message: "User not found.",
          status: 404,
        }),
      );
    }

    await deleteUserById(id);

    return NextResponse.json({ status: "ok", message: "Account deleted." });
  } catch (error) {
    if (error instanceof ZodError) {
      return sendError(
        buildError({
          code: PASSWORD_REQUIRED_ERROR,
          message: "Password is required.",
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
