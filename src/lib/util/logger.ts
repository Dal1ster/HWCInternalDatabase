import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const transports = [
    new DailyRotateFile({
        filename: `%DATE%.log`,
        dirname: 'logs',
        datePattern: 'YYYY-MM-DD',
        maxFiles: 15,
        handleExceptions: true,
        handleRejections: true
    }),
    new DailyRotateFile({
        filename: `%DATE%.error.log`,
        level: 'error',
        dirname: 'logs',
        datePattern: 'YYYY-MM-DD',
        maxFiles: 15,
        handleExceptions: true,
        handleRejections: true
    }),
    new winston.transports.Console({
        handleExceptions: true,
        handleRejections: true
    }),
]

const logger = winston.createLogger({
    transports: transports,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
});

export default logger;