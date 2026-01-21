import pinoPretty from 'pino-pretty';

export const createConsoleTransport = (prettyPrint: boolean = false) => {
  if (prettyPrint) {
    return {
      level: 'debug',
      stream: pinoPretty({
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        messageFormat: (log: Record<string, unknown>) => {
          const { component, msg } = log;
          return component ? `[${component}] ${String(msg)}` : String(msg);
        },
        singleLine: false,
      }),
    };
  }
  return {
    level: process.env.LOG_LEVEL || 'info',
    stream: process.stdout,
  };
};
