import ModeratorModel from "@/database/moderator/moderator.model";
import {
  createModerator,
  findModeratorByEmail,
} from "@/database/moderator/moderator.repository";
import { createPermission } from "@/database/permission/permission.repository";
import UserModel from "@/database/user/user.model";
import {
  createUser,
  findUserByEmail,
  findUsers,
} from "@/database/user/user.repository";
import { connectToDatabase } from "@/lib/database";
import { getMMDB } from "@/lib/mmdb";
import { hashPassword } from "@/utils/password.utils";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    // const {
    //   page = 1,
    //   limit = 10,
    //   sortBy = { createdAt: -1 },
    // } = await request.json();

    const page = 1;
    const limit = 10;
    const sortBy: { [key: string]: -1 | 1 } = { created_at: -1 };

    const skip = (page - 1) * limit;

    const moderators = await ModeratorModel.find()
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    return NextResponse.json(moderators);
  } catch (error) {
    console.log(`Error getting moderators: ${error}`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { email, password, display_name, permissions } = body;

    const existingModerator = await findModeratorByEmail(email);

    if (existingModerator) {
      return NextResponse.json(
        { error: "Moderator already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const createdModerator = await createModerator({
      email,
      password_hash: hashedPassword,
      name: display_name,
      permissions: permissions,
    });

    if (!createdModerator) {
      return NextResponse.json(
        { error: "Moderator not created" },
        { status: 500 },
      );
    }

    return NextResponse.json(createdModerator);
  } catch (error) {
    console.log(`Error creating moderator: ${error}`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
