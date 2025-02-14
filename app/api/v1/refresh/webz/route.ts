import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { fetchWebz } from "@/sources/webz";

export const POST = async () => {
  try {
    await connectToDatabase();
    fetchWebz();

    return NextResponse.json({ message: "Fetching successfully started." });
  } catch (error) {
    NextResponse.json({ message: error });
  }
};
