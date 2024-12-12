import pino from 'pino'

// https://github.com/navikt/frontend/blob/205b1be8944105663571eef0e5627052358ab05a/nextjs/pino-logging/utils/backendLogger.ts
export const logger = pino({
        timestamp: false,
        formatters: {
            level: (label) => {
                return { level: label };
            },
        },
    });
