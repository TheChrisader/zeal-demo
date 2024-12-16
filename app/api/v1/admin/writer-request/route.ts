import { NextResponse } from "next/server";
import WriterRequestModel from "@/database/writer-request/writer-request.model";

export async function GET() {
  try {
    const writerRequests = await WriterRequestModel.find();
    return NextResponse.json(writerRequests);
  } catch (error) {
    console.log(`Error getting writer requests: ${error}`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
