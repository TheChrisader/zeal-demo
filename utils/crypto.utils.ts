import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "crypto";

// Get encryption key from environment, with fallback for development
const ENCRYPTION_KEY =
  process.env.TWO_FA_ENCRYPTION_KEY ||
  "change-this-key-in-production-min-32-chars-long";
const ALGORITHM = "aes-256-gcm";

/**
 * Encrypt a 2FA secret using AES-256-GCM
 * @param text - The plain text secret to encrypt
 * @returns Object containing encrypted data, IV, and auth tag
 */
export const encryptSecret = (
  text: string,
): { encrypted: string; iv: string; authTag: string } => {
  const iv = randomBytes(16) as unknown as Uint8Array;
  // Derive a 32-byte key from the environment key
  const key = scryptSync(ENCRYPTION_KEY, "salt", 32) as unknown as Uint8Array;
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: Buffer.from(iv).toString("hex"),
    authTag: (authTag as Buffer).toString("hex"),
  };
};

/**
 * Decrypt a 2FA secret using AES-256-GCM
 * @param encrypted - The encrypted data
 * @param iv - The initialization vector (hex string)
 * @param authTag - The authentication tag (hex string)
 * @returns The decrypted plain text secret
 */
export const decryptSecret = (
  encrypted: string,
  iv: string,
  authTag: string,
): string => {
  const key = scryptSync(ENCRYPTION_KEY, "salt", 32) as unknown as Uint8Array;
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "hex") as unknown as Uint8Array,
  );

  decipher.setAuthTag(Buffer.from(authTag, "hex") as unknown as Uint8Array);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
