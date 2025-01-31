import type { Context, ContextAPI, Span, SpanContext } from "@opentelemetry/api"

let otelWrapper: { getSpan: ((context: Context) => Span | undefined) | undefined, context: ContextAPI | undefined } =  { getSpan: undefined, context: undefined }

if (typeof window === 'undefined') {
    // Only require OpenTelemetry on the server
    import('@opentelemetry/api')
        .then((otel) => {
            otelWrapper.getSpan = otel.trace.getSpan;
            otelWrapper.context = otel.context;
        }) ;
}

export const getActiveSpanContext = (): SpanContext | undefined => {
    const { context, getSpan } = otelWrapper;
    if (!getSpan || !context) return undefined;
    const span = getSpan(context.active());
    if (span) return span.spanContext();
    return undefined;
}

export default otelWrapper;