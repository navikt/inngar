import { createLogger, format, transports } from 'winston';

const maskedJsonFormat = format.printf((logEntry) => {
    return JSON.stringify({
        timestamp: new Date(),
        ...logEntry,
    })
});

export const loggerServer = createLogger({
    level: 'info',
    format: format.combine(
        format.splat(),
        maskedJsonFormat,
    ),
    transports: [new transports.Console()]
});