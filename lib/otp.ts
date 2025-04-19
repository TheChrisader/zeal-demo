import * as OTPAuth from "otpauth";

const createOTPGenerator = (email: string) => {
  return new OTPAuth.TOTP({
    issuer: "Zeal News Africa",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 60 * 4,
    secret: "NB2W45DFOIZA", // In production, generate a unique secret for each user
  });
};

export const generateOTP = (email: string) => {
  const totp = createOTPGenerator(email);
  return totp.generate();
};

export const generateOTPURL = (email: string) => {
  const totp = new OTPAuth.TOTP({
    issuer: "Zeal News Africa",
    label: encodeURIComponent(email),
    algorithm: "SHA1",
    digits: 6,
    period: 30, // Changed from 240 to standard 30-second window
    secret: OTPAuth.Secret.fromBase32("NB2W45DFOIZA======"), // Added base32 padding
  });
  return totp.toString();
};

export const validateOTP = (email: string, token: string) => {
  const totp = createOTPGenerator(email);
  return totp.validate({ token, window: 1 });
};

export const validate2FA = (email: string, token: string) => {
  const totp = new OTPAuth.TOTP({
    issuer: "Zeal News Africa",
    label: encodeURIComponent(email),
    algorithm: "SHA1",
    digits: 6,
    period: 30, // Changed from 240 to standard 30-second window
    secret: OTPAuth.Secret.fromBase32("NB2W45DFOIZA======"), // Added base32 padding
  });
  return totp.validate({ token, window: 1 });
};
