import pino from "pino";
import * as fs from "fs";
import * as path from "path";

export const createFileTransport = () => {
  const logsDir = path.join(process.cwd(), "logs");

  // Ensure logs directory exists
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const date = new Date().toISOString().split("T")[0];

  // Return a multistream configuration for combined and error logs
  return pino.multistream([
    {
      level: "info",
      stream: pino.destination({
        dest: path.join(logsDir, `combined-${date}.log`),
        sync: false,
      }),
    },
    {
      level: "error",
      stream: pino.destination({
        dest: path.join(logsDir, `error-${date}.log`),
        sync: false,
      }),
    },
  ]);
};
