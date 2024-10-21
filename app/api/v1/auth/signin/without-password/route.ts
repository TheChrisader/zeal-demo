import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import * as MMDB from "mmdb-lib";
import { createPreferences } from "@/database/preferences/preferences.repository";
import { createUser, findUserByEmail } from "@/database/user/user.repository";
import { lucia } from "@/lib/auth/auth";
import { connectToDatabase, newId } from "@/lib/database";
import { buildError, sendError } from "@/utils/error";
import { INTERNAL_ERROR } from "@/utils/error/error-codes";
import { getMMDB } from "@/lib/mmdb";

// TODO: Security is weak, implement google id/token verification

export const POST = async (request: NextRequest) => {
  try {
    await connectToDatabase();
    const body = await request.json();

    console.log(body);

    const existingUser = await findUserByEmail(body.email);

    if (existingUser) {
      const session = await lucia.createSession(newId(existingUser.id), {});
      const sessionCookie = await lucia.createSessionCookie(session.id);

      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );

      return NextResponse.json(existingUser, {
        status: 200,
      });

      //   return new Response(null, {
      //     status: 302,
      //     headers: {
      //       Location: "/",
      //     },
      //   });
    }

    const header = headers();
    let ip_address = header.get("x-forwarded-for");

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
      email: body.email,
      display_name: body.display_name,
      has_email_verified: body.has_email_verified,
      avatar: body.avatar,
      auth_provider: "google",
      ip_address: ip_address,
      has_password: false,
      location: location,
      username: body.username,
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

    await createPreferences({ user_id: createdUser.id });

    const session = await lucia.createSession(newId(createdUser.id), {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    return NextResponse.json(createdUser, {
      status: 201,
      headers: { "Set-Cookie": sessionCookie.serialize() },
    });
  } catch (error) {
    console.log(error);
    // @ts-expect-error TODO
    return new Response(error.message, { status: 500 });
    // return NextResponse.json(error);
  }
};
