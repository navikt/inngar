let getSpan, context; // These will be undefined on the client

if (typeof window === 'undefined') {
    // Only require OpenTelemetry on the server
    import('@opentelemetry/api')
        .then((otel) => {
            getSpan = otel.trace.getSpan;
            context = otel.context;
        }) ;
}

const otelWrapper = { getSpan, context }
export default otelWrapper;