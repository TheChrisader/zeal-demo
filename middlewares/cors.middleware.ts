import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "./middleware.type";

const allowedOrigins = [
  process.env.ADMIN_DASHBOARD_URL,
  "https://admin.zealnews.africa",
  "http://localhost:5173",
];
console.log(allowedOrigins, "ALLOWED ORIGINS");

const corsOptions = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const corsMiddleware: MiddlewareFactory = (next, response) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    // console.log(allowedOrigins, "ALLOWED ORIGINS");
    if (
      request.nextUrl.pathname.startsWith("/api/v1/admin") ||
      request.nextUrl.pathname === "/api/v1/post/parse"
    ) {
      const origin = request.headers.get("origin") ?? "";
      const isAllowedOrigin = allowedOrigins.includes(origin);

      // Handle preflighted requests
      const isPreflight = request.method === "OPTIONS";

      if (isPreflight) {
        const preflightHeaders = {
          ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
          ...corsOptions,
        };

        return NextResponse.json({}, { headers: preflightHeaders });
      }

      //   const newHeaders = new Headers(request.headers);

      //   if (isAllowedOrigin) {
      //     newHeaders.set("Access-Control-Allow-Origin", origin);
      //   }

      //   Object.entries(corsOptions).forEach(([key, value]) => {
      //     newHeaders.set(key, value);
      //   });

      //   return NextResponse.next({ request: { headers: newHeaders } });

      // const response = NextResponse.next();

      if (isAllowedOrigin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
      }

      Object.entries(corsOptions).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      const middlewareResponse = await next(request, _next);

      if (!middlewareResponse) {
        return response;
      }

      if (isAllowedOrigin) {
        middlewareResponse.headers.set("Access-Control-Allow-Origin", origin);
      }

      Object.entries(corsOptions).forEach(([key, value]) => {
        middlewareResponse.headers.set(key, value);
      });

      return middlewareResponse;

      //   return response;
    }

    return next(request, _next);
  };
};
