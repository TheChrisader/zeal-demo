import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { MiddlewareFactory } from "./middleware.type";

export const jwtMiddleware: MiddlewareFactory = (next) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    // Paths that don't require authentication
    if (request.nextUrl.pathname === "/api/v1/admin/auth/signin") {
      return next(request, _next);
    }

    // Check auth for admin routes
    if (
      request.nextUrl.pathname.startsWith("/api/v1/admin") ||
      request.nextUrl.pathname === "/api/v1/post/parse"
    ) {
      const authHeader = request.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      const payload = await verifyToken(token);

      if (!payload) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }

    return next(request, _next);
  };
};

// export const config = {
//   matcher: ["/admin/:path*", "/api/admin/:path*", "/login"],
// };
