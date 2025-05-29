import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import { MiddlewareFactory } from "./middleware.type";

const BLACKLIST_PATHNAMES = [
  "/bookmarks",
  "/settings",
  "/write",
  "/editor",
  "/drafts",
];

export const authMiddleware: MiddlewareFactory = (next) => {
  return async (req: NextRequest, _next: NextFetchEvent) => {
    if (BLACKLIST_PATHNAMES.includes(req.nextUrl.pathname)) {
      const { session } = await serverAuthGuard();

      if (!session) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return next(req, _next);
  };
};
