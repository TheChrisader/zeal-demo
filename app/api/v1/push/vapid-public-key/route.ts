import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ vapidPublicKey: process.env.VAPID_PUBLIC_KEY });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
