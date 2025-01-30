let otelWrapper = { getSpan: undefined, context: undefined }

if (typeof window === 'undefined') {
    // Only require OpenTelemetry on the server
    import('@opentelemetry/api')
        .then((otel) => {
            otelWrapper.getSpan = otel.trace.getSpan;
            otelWrapper.context = otel.context;
        }) ;
}

export default otelWrapper;