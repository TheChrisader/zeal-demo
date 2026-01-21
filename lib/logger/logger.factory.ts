import pino, { Logger, StreamEntry } from "pino";
import { errorFormatter } from "./formatters/error-formatter";
import { getLoggerConfig } from "./logger.config";
import { createConsoleTransport } from "./transports/console-transport";

let loggerInstance: Logger | null = null;

export const createLogger = (name?: string): Logger => {
  if (loggerInstance) {
    return name ? loggerInstance.child({ component: name }) : loggerInstance;
  }

  const config = getLoggerConfig(process.env.NODE_ENV || "development");
  // const isProduction = process.env.NODE_ENV === 'production';

  const streams: StreamEntry[] = [
    createConsoleTransport(config.prettyPrint) as StreamEntry,
  ];

  // if (isProduction) {
  //   // Add file streams in production - using raw pino.destination for file output
  //   const logsDir = `${process.cwd()}/logs`;
  //   streams.push(
  //     { level: 'info', stream: pino.destination(`${logsDir}/combined.log`) },
  //     { level: 'error', stream: pino.destination(`${logsDir}/error.log`) }
  //   );
  // }

  // Safely get Node.js specific values with fallbacks
  const pid = typeof process !== "undefined" ? process.pid : undefined;
  let hostname: string | undefined = undefined;

  // Try to get hostname from environment variable first
  if (typeof process !== "undefined" && process.env.HOSTNAME) {
    hostname = process.env.HOSTNAME;
  }

  loggerInstance = pino(
    {
      level: config.level,
      redact: config.redact,
      timestamp: config.timestamp,
      formatters: {
        level: (label) => ({ level: label }),
        log: (object) => ({ ...object, env: process.env.NODE_ENV }),
      },
      serializers: {
        error: errorFormatter,
      },
      base: {
        ...(pid !== undefined && { pid }),
        ...(hostname !== undefined && { hostname }),
      },
    },
    pino.multistream(streams),
  );

  return name ? loggerInstance.child({ component: name }) : loggerInstance;
};

export const getLogger = (name?: string): Logger => {
  if (!loggerInstance) {
    return createLogger(name);
  }
  return name ? loggerInstance.child({ component: name }) : loggerInstance;
};
