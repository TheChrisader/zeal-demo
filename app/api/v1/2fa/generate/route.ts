import { NextRequest, NextResponse } from "next/server";
import { generateOTPURL } from "@/lib/otp";

export async function POST(request: NextRequest) {
  try {
    // In a real app, get the user's email from the session
    const userEmail = "user@example.com";

    // Create a new TOTP instance
    const qrCodeUrl = generateOTPURL(userEmail);

    // Return the QR code URL
    return NextResponse.json({ qrCode: qrCodeUrl });
  } catch (error) {
    console.error("Error generating 2FA:", error);
    return NextResponse.json(
      { error: "Failed to generate 2FA QR code" },
      { status: 500 },
    );
  }
}
