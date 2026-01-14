import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { verifyToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  await connectToDatabase();
  const authHeader = request.headers.get("authorization");
  const token = authHeader!.split(" ")[1];
  const payload = await verifyToken(token!);

  return NextResponse.json(payload, {
    status: 200,
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
  });
}
