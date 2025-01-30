let getSpan, context; // These will be undefined on the client

if (typeof window === 'undefined') {
    // Only require OpenTelemetry on the server
    const otel = import('@opentelemetry/api')
        .then((otel) => {
            getSpan = otel.trace.getSpan;
            context = otel.context;
        }) ;
}

export { getSpan, context };