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

    const moderators = await UserModel.aggregate([
      {
        $match: {
          role: "admin",
        },
      },
      {
        $lookup: {
          from: "permissions",
          localField: "_id",
          foreignField: "user_id",
          pipeline: [
            {
              $project: {
                permissions: 1,
              },
            },
          ],
          as: "_permissions",
        },
      },
      {
        $addFields: {
          permissions: {
            $arrayElemAt: ["$_permissions.permissions", 0],
          },
        },
      },
      {
        $project: {
          password_hash: 0,
          _permissions: 0,
        },
      },
      // {
      //   $project: collection1Select ?
      //     collection1Select.split(' ').reduce((acc, field) => {
      //       acc[field] = 1;
      //       return acc;
      //     }, {}) : {}
      // },
      //   { $unwind: { path: "$_permissions", preserveNullAndEmptyArrays: true } },
      { $sort: sortBy },
      { $skip: skip },
      { $limit: limit },
    ]);

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

    const header = headers();
    let ip_address = header.get("x-forwarded-for");

    let location: string;
    if (ip_address === "::1" || !ip_address) {
      ip_address = "127.0.0.1";
      location = "Nigeria";
    } else {
      const mmdb = await getMMDB();
      const result = mmdb.get(ip_address);

      if (!result?.country?.names["en"]) {
        location = "Nigeria";
      } else {
        location = result?.country?.names["en"];
      }
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const createdUser = await createUser({
      email: email.toLowerCase().trim(),
      username: email.split("@")[0].toLowerCase().trim(),
      display_name,
      password: hashedPassword,
      location,
      ip_address,
      auth_provider: "email",
      role: "admin",
      has_password: true,
    });

    if (!createdUser) {
      return NextResponse.json({ error: "User not created" }, { status: 500 });
    }

    await createPermission({ user_id: createdUser.id as string, permissions });

    return NextResponse.json(createdUser);
  } catch (error) {
    console.log(`Error creating moderator: ${error}`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
