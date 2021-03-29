import * as winston from "winston";

const log = winston.createLogger({
  level: process.env.NODE_ENV !== "production" ? "debug" : "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(
      ({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`
    )
  ),
  transports: [new winston.transports.Console()],
});

export default log;
