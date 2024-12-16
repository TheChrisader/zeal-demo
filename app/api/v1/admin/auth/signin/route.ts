import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/database/user/user.model";
import { lucia } from "@/lib/auth/auth";
import { connectToDatabase, newId } from "@/lib/database";
import { verifyPassword } from "@/utils/password.utils";
import { createToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response("Invalid username or password", { status: 400 });
    }

    // const user = await UserModel.findOne({ email: email}).select(
    //   "-password_hash",
    // );

    const user = await UserModel.findOne({ email: email }).lean();

    if (!user || user.role !== "admin") {
      return new Response("Invalid username or password", { status: 400 });
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      return new Response("Invalid username or password", { status: 400 });
    }

    const { password_hash: _, ...userData } = user;

    const token = await createToken({ email, role: "admin" });

    return NextResponse.json(
      { user: userData, token, message: "Signed In" },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(`Admin signin error: ${error}`);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
  });
}
