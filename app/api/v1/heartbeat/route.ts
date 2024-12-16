import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth/auth";
import connectionManager from "@/lib/connection-manager";

export async function POST() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    await connectionManager.updatePing(user?.id.toString() as string);

    return NextResponse.json({ message: "Ping updated." }, { status: 200 });
  } catch (error) {
    console.log("Error updating ping:", error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
}
