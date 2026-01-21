export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    suppressPunycodeWarning();
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Dynamic imports to ensure modules are only loaded in Node.js environment
    const { initializeOpenTelemetry } = await import("./lib/telemetry");
    const { createLogger } = await import("./lib/logger");

    // Initialize OpenTelemetry first
    initializeOpenTelemetry();

    // Then initialize Pino logger
    const logger = createLogger("instrumentation");

    // Log telemetry status in development
    if (process.env.NODE_ENV === 'development') {
      const { exporterStatus } = await import("./lib/telemetry/exporters");
      logger.info(exporterStatus, "OpenTelemetry exporters configured");
    }

    logger.info(
      {
        nodeEnv: process.env.NODE_ENV,
        version: process.env.npm_package_version,
      },
      "Application starting up",
    );

    // Process error handlers
    process.on("uncaughtException", (error) => {
      logger.fatal(error, "Uncaught Exception");
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.fatal({ reason, promise }, "Unhandled Rejection");
      process.exit(1);
    });

    process.on("warning", (warning) => {
      logger.warn(warning, "Process Warning");
    });
  }
}

/**
 * Suppresses the specific 'punycode' DeprecationWarning.
 * This is caused by older dependencies (whatwg-url) used by OpenTelemetry/Google Cloud SDKs
 * conflicting with Node 21+.
 */
function suppressPunycodeWarning() {
  const originalEmit = process.emit;

  // @ts-expect-error - Overriding process.emit is not standard TS behavior but required here
  process.emit = function (
    name: string | symbol,
    ...args: any[]
  ): boolean | NodeJS.Process {
    if (name === "warning") {
      const warning = args[0] as Error;

      // Check specifically for the punycode deprecation
      if (
        warning.name === "DeprecationWarning" &&
        warning.message.includes("punycode")
      ) {
        return false;
      }
    }

    return (originalEmit as Function).apply(process, [name, ...args]);
  };
}
