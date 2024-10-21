import * as OTPAuth from "otpauth";

const createOTPGenerator = (email: string) => {
  return new OTPAuth.TOTP({
    issuer: "Zeal News Africa",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 240,
    secret: "NB2W45DFOIZA",
  });
};

export const generateOTP = (email: string) => {
  const totp = createOTPGenerator(email);
  return totp.generate();
};

export const validateOTP = (email: string, token: string) => {
  const totp = createOTPGenerator(email);
  return totp.validate({ token, window: 1 });
};
