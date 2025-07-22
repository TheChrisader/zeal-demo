import { NextRequest, NextResponse } from "next/server";
import { validate2FA, validateOTP } from "@/lib/otp";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    // In a real app, get the user's email from the session
    const userEmail = "user@example.com";

    // Validate the OTP
    const isValid: number | null = validate2FA(userEmail, code);
    console.log("isValid", isValid, code);

    if (isValid === null) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 },
      );
    }

    // In production, update user's 2FA status in database here

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA code" },
      { status: 500 },
    );
  }
}
