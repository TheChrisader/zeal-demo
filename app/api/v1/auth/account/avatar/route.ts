import { NextRequest, NextResponse } from "next/server";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { connectToDatabase } from "@/lib/database";
import { findUserById, updateUser } from "@/database/user/user.repository";
import { buildError, sendError } from "@/utils/error";
import {
  FILE_TOO_LARGE_ERROR,
  INTERNAL_ERROR,
  INVALID_INPUT_ERROR,
  USER_NOT_FOUND_ERROR,
  WRONG_FILE_FORMAT_ERROR,
} from "@/utils/error/error-codes";
import {
  AUTHORIZED_IMAGE_MIME_TYPES,
  AUTHORIZED_IMAGE_SIZE,
  getKeyFromUrl,
} from "@/utils/file.utils";
import { deleteFileById, findFileByKey } from "@/database/file/file.repository";
import { deleteFileFromKey, uploadImageToS3 } from "@/lib/bucket";

export const GET = async () => {
  try {
    await connectToDatabase();
    const { user } = await serverAuthGuard();

    if (!user) {
      return NextResponse.json({ error: "User not found." });
    }

    // const userData = await findUserById(user.id);

    // if (!userData) {
    //     return NextResponse.json({error: "User not found."});
    // }

    return NextResponse.json(user.avatar);
  } catch (error) {
    return sendError(
      buildError({
        code: INTERNAL_ERROR,
        message: /* error.message || */ "An error occured.",
        status: 500,
        data: error,
      }),
    );
  }
};

export const PUT = async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get("avatar") as (Blob & { name: string }) | null;

    if (!file) {
      return sendError(
        buildError({
          code: INVALID_INPUT_ERROR,
          message: "No file provided.",
          status: 422,
        }),
      );
    }

    if (!AUTHORIZED_IMAGE_MIME_TYPES.includes(file.type)) {
      return sendError(
        buildError({
          code: WRONG_FILE_FORMAT_ERROR,
          message: "Wrong file format.",
          status: 422,
        }),
      );
    }

    if (file.size > AUTHORIZED_IMAGE_SIZE) {
      return sendError(
        buildError({
          code: FILE_TOO_LARGE_ERROR,
          message: "The file is too large.",
          status: 422,
        }),
      );
    }

    await connectToDatabase();

    const { user } = await serverAuthGuard();

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

    if (
      userData.avatar
        ?.toLowerCase()
        ?.includes((process.env.CLOUDFRONT_BASE_URL as string).toLowerCase())
    ) {
      // const oldPhotoKey = userData.avatar.split(`${process.env.CLOUDFRONT_BASE_URL}/`)[1];
      const oldPhotoKey = getKeyFromUrl(userData.avatar);
      await deleteFileFromKey(oldPhotoKey);
    }

    const photoKey = await uploadImageToS3(file, "avatars/");

    if (!photoKey) {
      return NextResponse.json({ error: "Failed to upload image." });
    }

    const updatedUser = await updateUser(
      {
        id: user.id,
        avatar: `${process.env.CLOUDFRONT_BASE_URL}/${photoKey}`,
      },
      { newDocument: true },
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update user." });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return sendError(
      buildError({
        code: INTERNAL_ERROR,
        message: /* error.message || */ "An error occured.",
        status: 500,
        data: error,
      }),
    );
  }
};
