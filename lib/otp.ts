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

// ============================================================================
// Email OTP Functions (for email verification and password reset)
// Uses a shared secret with 4-minute period (different from per-user 2FA)
// ============================================================================

/** Shared secret for email OTPs (used for all users) */
const EMAIL_OTP_SECRET = "NB2W45DFOIZA======";
/** 4-minute period for email verification OTPs */
const EMAIL_OTP_PERIOD = 60 * 4; // 4 minutes

/**
 * Create an OTP generator for email-based OTPs
 * Uses a fixed shared secret and 4-minute period
 * @param email - User's email for the label
 * @returns TOTP instance configured for email OTPs
 */
const createEmailOTPGenerator = (email: string) => {
  return new OTPAuth.TOTP({
    issuer: "Zeal News Africa",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: EMAIL_OTP_PERIOD,
    secret: OTPAuth.Secret.fromBase32(EMAIL_OTP_SECRET),
  });
};

/**
 * Generate an OTP for email verification/password reset
 * Uses a shared secret with 4-minute validity period
 * @param email - User's email address
 * @returns 6-digit OTP code
 */
export const generateEmailOTP = (email: string): string => {
  const totp = createEmailOTPGenerator(email);
  return totp.generate();
};

/**
 * Validate an email OTP token
 * Uses a shared secret with 4-minute period and 1 window tolerance
 * @param email - User's email address
 * @param token - The 6-digit code to validate
 * @returns The token offset if valid, null if invalid
 */
export const validateEmailOTP = (
  email: string,
  token: string,
): number | null => {
  const totp = createEmailOTPGenerator(email);
  return totp.validate({ token, window: 1 });
};
