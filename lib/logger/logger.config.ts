import pino from 'pino';
import { redactionRules } from './redaction/redaction-rules';

export interface LoggerConfig {
  level: pino.Level;
  prettyPrint: boolean;
  redact: string[];
  timestamp: () => string;
}

export const getLoggerConfig = (env: string): LoggerConfig => {
  const isDevelopment = env === 'development';

  return {
    level: isDevelopment ? 'debug' : (process.env.LOG_LEVEL as pino.Level) || 'info',
    prettyPrint: isDevelopment && process.env.LOG_PRETTY_PRINT !== 'false',
    redact: redactionRules,
    timestamp: pino.stdTimeFunctions.isoTime,
  };
};
