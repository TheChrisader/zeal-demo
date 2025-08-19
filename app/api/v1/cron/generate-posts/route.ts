import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { handleBatches } from "@/sources";

export async function POST() {
  try {
    await connectToDatabase();
    handleBatches();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.error();
  }
}
