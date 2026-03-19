import {
    type Context,
    type ContextAPI,
    type Span,
    type SpanContext,
    SpanKind,
    type Tracer,
} from "@opentelemetry/api"

interface OtelWrapper {
    getSpan: ((context: Context) => Span | undefined) | undefined
    context: ContextAPI | undefined
    tracer: Tracer | undefined
    SpanKind: typeof SpanKind | undefined
}

let otelWrapper: OtelWrapper = {
    getSpan: undefined,
    context: undefined,
    tracer: undefined,
    SpanKind: undefined,
}

if (typeof window === "undefined") {
    // Only require OpenTelemetry on the server
    import("@opentelemetry/api").then((otel) => {
        otelWrapper.getSpan = otel.trace.getSpan
        otelWrapper.context = otel.context
        otelWrapper.SpanKind = otel.SpanKind
        otelWrapper.tracer = otel.trace.getTracer(
            `${process.env.OTEL_SERVICE_NAME}:httpclient`,
        )
    })
}

export const getActiveSpanContext = (): SpanContext | undefined => {
    const { context, getSpan } = otelWrapper
    if (!getSpan || !context) return undefined
    const span = getSpan(context.active())
    if (span) return span.spanContext()
    return undefined
}

export const startActiveSpan = <T>(
    spanName: string,
    callback: () => Promise<T>,
) => {
    const { tracer, SpanKind } = otelWrapper
    if (!tracer || !SpanKind) return callback()
    return tracer.startActiveSpan(
        `${spanName}`,
        { kind: SpanKind.CLIENT },
        async (span) => {
            return callback()
        },
    )
}

export default otelWrapper
