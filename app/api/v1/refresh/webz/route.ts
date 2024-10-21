import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { fetchWebz } from "@/sources/webz";

export const POST = async () => {
  try {
    await connectToDatabase();
    await fetchWebz();

    return NextResponse.json({ message: "Refreshed" });
  } catch (error) {
    NextResponse.json({ message: error });
  }
};
