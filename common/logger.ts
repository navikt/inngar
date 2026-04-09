import pino from "pino"
import { getActiveSpanContext } from "./onlyServerOtelUtils.ts"

// https://github.com/navikt/frontend/blob/205b1be8944105663571eef0e5627052358ab05a/nextjs/pino-logging/utils/backendLogger.ts
export const logger = pino({
    timestamp: false,
    mixin: () => {
        const spanContext = getActiveSpanContext()
        if (spanContext) {
            const { traceId, spanId, traceFlags } = spanContext
            return {
                trace_id: traceId,
                span_id: spanId,
                trace_flags: traceFlags,
            }
        }
        return {}
    },
    formatters: {
        level: (label) => {
            return { level: label }
        },
        log: (object: any) => {
            if (object.err) {
                const err =
                    object.err instanceof Error
                        ? pino.stdSerializers.err(object.err)
                        : object.err
                object.stack_trace = err.stack
                object.type = err.type
                object.message = err.message
                delete object.err
            }

            return object
        },
    },
})
