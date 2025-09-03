import { NextRequest, NextResponse } from "next/server";
import ModeratorModel from "@/database/moderator/moderator.model";
import { connectToDatabase } from "@/lib/database";
import { createToken } from "@/lib/jwt";
import { verifyPassword } from "@/utils/password.utils";
import { findModeratorByEmail } from "@/database/moderator/moderator.repository";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 400 },
      );
    }

    const moderator = await findModeratorByEmail(email);

    if (!moderator) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 400 },
      );
    }

    const isPasswordValid = await verifyPassword(
      password,
      moderator.password_hash,
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 400 },
      );
    }

    const { _id, password_hash: _, ...moderatorData } = moderator;

    const token = await createToken({
      id: _id,
      email,
      permissions: moderator.permissions,
    });

    return NextResponse.json(
      { user: moderatorData, token, message: "Signed In" },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(`Admin signin error: ${error}`);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
  });
}
