import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { fetchWorldNewsHeadlines } from "@/sources/worldnews";

export const POST = async () => {
  try {
    await connectToDatabase();
    await fetchWorldNewsHeadlines();

    return NextResponse.json({ message: "Refreshed" });
  } catch (error) {
    NextResponse.json({ message: error });
  }
};
