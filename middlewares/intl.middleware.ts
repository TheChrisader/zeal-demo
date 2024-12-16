import { NextFetchEvent, NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { MiddlewareFactory } from "./middleware.type";
import { routing } from "../i18n/routing";

// export default createMiddleware(routing);

export const intlMiddleware: MiddlewareFactory = (next) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    if (
      !request.nextUrl.pathname.startsWith("/fr") ||
      !request.nextUrl.pathname.startsWith("/en")
    ) {
      if (request.nextUrl.pathname !== "/") {
        return next(request, _next);
      }
    }
    console.log("object");

    const defaultLocale =
      request.headers.get("x-set-locale") || routing.defaultLocale;

    const handleI18nRouting = createMiddleware(routing);

    const response = handleI18nRouting(request);

    response.headers.set("x-set-locale", defaultLocale);

    return response;
  };
};

// export const config = {
//   // Match only internationalized pathnames
//   matcher: ["/", "/(fr|en)/:path*"],
// };
