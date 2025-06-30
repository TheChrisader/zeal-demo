import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(body);
    return NextResponse.json(
      { message: "Successfully unsubscribed." },
      { status: 200 },
    );
  } catch (error) {
    console.log(`Error unsubscribing: ${error}`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
