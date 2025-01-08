import { OAuth2RequestError } from "arctic";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import * as MMDB from "mmdb-lib";
// import { generateIdFromEntropySize } from "lucia";
import { createPreferences } from "@/database/preferences/preferences.repository";
import { createUser, findUserByEmail } from "@/database/user/user.repository";
import { lucia } from "@/lib/auth/auth";
import { google } from "@/lib/auth/providers/google";
import { connectToDatabase, newId } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import { INTERNAL_ERROR } from "@/utils/error/error-codes";
import { getMMDB } from "@/lib/mmdb";
import { redirect } from "@/i18n/routing";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("google_oauth_state")?.value ?? null;
  const codeVerifier =
    cookies().get("google_oauth_code_verifier")?.value ?? null;

  if (
    !code ||
    !state ||
    !storedState ||
    !codeVerifier ||
    state !== storedState
  ) {
    return new Response("Invalid state", { status: 400 });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const googleUserResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      },
    );

    await connectToDatabase();

    const googleUser = await googleUserResponse.json();
    const existingUser = await findUserByEmail(googleUser.email);

    if (existingUser) {
      const session = await lucia.createSession(newId(existingUser.id), {});
      const sessionCookie = await lucia.createSessionCookie(session.id);

      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
      // redirect to "/"

      return NextResponse.redirect(new URL("/", request.url));
    }

    const header = headers();
    let ip_address = header.get("CF-Connecting-IP");

    let location: string;
    if (ip_address === "::1" || !ip_address) {
      ip_address = "127.0.0.1";
      location = "Nigeria";
    } else {
      // const mmdbLocation = await fs.readFile("/mmdb/GeoLite2-Country.mmdb");

      // const mmdb = new MMDB.Reader<MMDB.CountryResponse>(mmdbLocation);
      const mmdb = await getMMDB();
      const result = mmdb.get(ip_address);

      if (!result?.country?.names["en"]) {
        location = "Nigeria";
      } else {
        location = result?.country?.names["en"];
      }
    }

    const createdUser = await createUser({
      email: googleUser.email,
      display_name: googleUser.name,
      has_email_verified: googleUser.email_verified,
      avatar: googleUser.picture,
      auth_provider: "google",
      location: location,
      ip_address: ip_address,
      has_password: false,
      username: googleUser.email.split("@")[0],
      password: "",
    });

    if (!createdUser) {
      return sendError(
        buildError({
          code: INTERNAL_ERROR,
          message: "User not created.",
          status: 500,
        }),
      );
    }

    const APPROVED_COUNTRY_LIST = ["Nigeria", "Ghana", "South Africa", "Kenya"];
    let locationPreference = "Nigeria";

    if (APPROVED_COUNTRY_LIST.includes(createdUser.location)) {
      locationPreference = createdUser.location;
    }

    await createPreferences({
      user_id: createdUser.id,
      country: locationPreference,
    });

    const session = await lucia.createSession(newId(createdUser.id), {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    return NextResponse.redirect(new URL("/onboarding", request.url), {
      status: 302,
      headers: { "Set-Cookie": sessionCookie.serialize() },
    });

    // return NextResponse.json(
    //   { message: "Created", user: createdUser },
    //   {
    //     status: 201,
    //     headers: { "Set-Cookie": sessionCookie.serialize() },
    //   },
    // );
  } catch (error) {
    if (error instanceof OAuth2RequestError) {
      return new Response("Invalid code", { status: 400 });
    }
    return new Response("Server Error", { status: 500 });
  }
}
