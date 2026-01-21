import { NextFetchEvent, NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { MiddlewareFactory } from "./middleware.type";

// Paths to skip logging (filler requests)
const SKIP_LOGGING_PATTERNS = [
  "/favicon",
  "/_next/",
  "/__nextjs",
  "/health",
  "/api/health",
  "/heartbeat",
  "/api/v1/heartbeat",
  "/robots.txt",
  "/sitemap",
  "/static",
];

function shouldSkipLogging(pathname: string): boolean {
  return SKIP_LOGGING_PATTERNS.some((pattern) => pathname.startsWith(pattern));
}

export const loggingMiddleware: MiddlewareFactory = (next, _response) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const pathname = request.nextUrl.pathname;

    // Skip logging for filler requests
    if (shouldSkipLogging(pathname)) {
      // Still add request ID for traceability
      const requestId = uuidv4();
      request.headers.set("x-request-id", requestId);

      const middlewareResponse = await next(request, _next);

      if (middlewareResponse) {
        middlewareResponse.headers.set("x-request-id", requestId);
      }

      return middlewareResponse;
    }

    const requestId = uuidv4();
    const startTime = Date.now();

    // Add request ID to headers for traceability
    request.headers.set("x-request-id", requestId);

    // Only use Pino logger in Node.js runtime
    if (process.env.NEXT_RUNTIME === "nodejs") {
      const { createChildLogger } = await import("@/lib/logger");

      const logger = createChildLogger("middleware", {
        requestId,
        method: request.method,
        pathname: request.nextUrl.pathname,
      });

      logger.debug(
        {
          method: request.method,
          pathname: request.nextUrl.pathname,
          userAgent: request.headers.get("user-agent"),
        },
        "Incoming request",
      );

      try {
        const middlewareResponse = await next(request, _next);
        const duration = Date.now() - startTime;

        logger.info(
          { status: middlewareResponse?.status, duration },
          "Request completed",
        );

        if (middlewareResponse) {
          middlewareResponse.headers.set("x-request-id", requestId);
        }

        return middlewareResponse;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error({ error, duration }, "Request failed");
        throw error;
      }
    }

    // Fallback for edge runtime - just pass through with request ID
    request.headers.set("x-request-id", requestId);

    try {
      const middlewareResponse = await next(request, _next);

      if (middlewareResponse) {
        middlewareResponse.headers.set("x-request-id", requestId);
      }

      return middlewareResponse;
    } catch (error) {
      throw error;
    }
  };
};
