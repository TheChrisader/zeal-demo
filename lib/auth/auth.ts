import { Lucia } from "lucia";
import type { Session, User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";
// import { IUser } from "@/types/user.type";
import { adapter } from "./adapter";
// import { Id } from "../database";

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getSessionAttributes: (attributes) => {
    return {
      two_fa_pending: attributes.two_fa_pending,
      two_fa_verified_at: attributes.two_fa_verified_at,
    };
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
      email: attributes.email,
      role: attributes.role,
      display_name: attributes.display_name,
      avatar: attributes.avatar,
      country: attributes.location,
      has_email_verified: attributes.has_email_verified,
      bio: attributes.bio,
      upgrade_pending: attributes.upgrade_pending,
      referral_code: attributes.referral_code,
      referral_count: attributes.referral_count,
      referred_by: attributes.referred_by,
      two_fa_enabled: attributes.two_fa_enabled ?? false,
    };
  },
});

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;

    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);

    // next.js throws when you attempt to set cookie when rendering page
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
    } catch {}
    return result;
  },
);

// export interface Session extends Lucia.Session {}
// export type Session = ReturnType<Lucia["validateSession"]>;
