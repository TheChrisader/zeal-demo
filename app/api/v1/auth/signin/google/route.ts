import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";
import { google } from "@/lib/auth/providers/google";
import { isProductionEnv } from "@/utils/env.utils";

export async function GET() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["profile", "email"],
  });

  cookies().set("google_oauth_state", state, {
    path: "/",
    secure: isProductionEnv(process.env.NODE_ENV),
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  cookies().set("google_oauth_code_verifier", codeVerifier, {
    path: "/",
    secure: isProductionEnv(process.env.NODE_ENV),
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return Response.redirect(url);
}
