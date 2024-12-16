import { NextRequest, NextResponse } from "next/server";
import { createInstallDoc } from "@/database/install/install.repository";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase, Id } from "@/lib/database";
import { IInstall } from "@/types/install.type";

export const POST = async (request: NextRequest) => {
  try {
    await connectToDatabase();
    const { user } = await validateRequest();

    const install_data: IInstall = await request.json();

    if (!install_data) {
      return NextResponse.json({ message: "Body cannot be empty" });
    }

    await createInstallDoc({
      ...install_data,
      user_id: user?.id as Id | undefined,
    });

    return NextResponse.json({ message: "Analytics updated" });
  } catch (error) {
    console.log("Install Analytics API error: ", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
};
