import { connectToDatabase } from "@/lib/database";
import { fetchNewsDataArticles } from "@/sources/newsdata";
import { NextResponse } from "next/server";

export const POST = async () => {
  try {
    await connectToDatabase();
    await fetchNewsDataArticles();

    return NextResponse.json({ message: "Refreshed" });
  } catch (error) {
    NextResponse.json({ message: error });
  }
};
