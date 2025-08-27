import { createLogger, format, transports, Logger } from 'winston';

const { combine, timestamp, errors, json, colorize, simple, printf } = format;

// Custom format for console output
const consoleFormat = printf(({ timestamp, level, message, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create the logger instance
const logger: Logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json(),
  ),
  defaultMeta: { service: 'xlsDB' },
  transports: [
    // Write all logs with importance level of 'error' or less to error.log
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), errors({ stack: true }), json()),
    }),
    // Write all logs to combined.log
    new transports.File({
      filename: 'logs/combined.log',
      format: combine(timestamp(), errors({ stack: true }), json()),
    }),
  ],
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        consoleFormat,
      ),
    }),
  );
}

export default logger;
