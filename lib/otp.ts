import * as OTPAuth from "otpauth";
import { randomBytes } from "crypto";

/**
 * Generate a unique Base32 secret for a user
 * @returns A 20-byte Base32 encoded secret
 */
export const generateSecret = (): string => {
  return new OTPAuth.Secret({ size: 20 }).base32;
};

/**
 * Generate a TOTP URL for QR code generation
 * @param email - User's email for the label
 * @param secret - The user's unique Base32 secret
 * @returns otpauth:// URL for QR code generation
 */
export const generateOTPURL = (email: string, secret: string): string => {
  const totp = new OTPAuth.TOTP({
    issuer: "Zeal News Africa",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30, // Standard 30-second window
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  return totp.toString();
};

/**
 * Validate a TOTP token against a user's secret
 * @param secret - The user's Base32 secret
 * @param token - The 6-digit code to validate
 * @returns The token offset if valid, null if invalid
 */
export const validate2FA = (secret: string, token: string): number | null => {
  const totp = new OTPAuth.TOTP({
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  // window: 1 allows 1 period before and after for clock skew
  return totp.validate({ token, window: 1 });
};

/**
 * Generate backup codes for recovery
 * @param count - Number of backup codes to generate (default: 10)
 * @returns Array of formatted backup codes (XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX)
 */
export const generateBackupCodes = (count: number = 10): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 16 random bytes (32 hex chars), format as XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
    const code = randomBytes(16).toString("hex").toUpperCase();
    // Format as groups of 4: XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
    const formatted = code.match(/.{1,4}/g)?.join("-") || code;
    codes.push(formatted);
  }
  return codes;
};
