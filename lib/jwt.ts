import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRE = "24h";

export async function createToken(payload: Record<string, unknown>) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRE)
    .sign(new TextEncoder().encode(JWT_SECRET));
  return token;
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
    );
    return verified.payload;
  } catch (err) {
    return null;
  }
}
