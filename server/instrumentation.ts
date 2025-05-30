import * as api from "@opentelemetry/api"
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http"
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express"
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"
import { NodeSDK } from "@opentelemetry/sdk-node"
import { PinoInstrumentation } from "@opentelemetry/instrumentation-pino"
import {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions"
import { Resource } from "@opentelemetry/resources"

const sdk = new NodeSDK({
    resource: new Resource({
        [ATTR_SERVICE_NAME]: "inngar",
        [ATTR_SERVICE_VERSION]: "1.0",
    }),
    // traceExporter: new ConsoleSpanExporter(),
    instrumentations: [
        getNodeAutoInstrumentations({
            "@opentelemetry/instrumentation-fs": { enabled: false },
        }),
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
        new PinoInstrumentation({}),
    ],
})

sdk.start()

const globalFetch = global.fetch

export async function fetcher(
    input: string | URL | Request,
    init?: RequestInit,
): Promise<Response> {
    const tracer = api.trace.getTracer(
        `${process.env.OTEL_SERVICE_NAME}:httpclient`,
    )

    let request: Request
    if (input instanceof Request) {
        request = input
    } else {
        request = new Request(input)
    }
    const method = request.method
    const url = new URL(request.url)

    return await tracer.startActiveSpan(
        `${method}`,
        { kind: api.SpanKind.CLIENT },
        async (span) => {
            const propagationHeaders: Record<string, string> = {}
            api.propagation.inject(api.context.active(), propagationHeaders)

            for (const [header, value] of Object.entries(propagationHeaders)) {
                request.headers.set(header, value)
            }

            span.setAttribute("server.address", url.host)
            span.setAttribute("server.port", url.port)
            span.setAttribute("url.full", url.toString())
            span.setAttribute("http.request.method", method)
            span.setAttribute("url.scheme", url.protocol)

            const response = await globalFetch(request, init)

            span.setAttribute("http.response.status_code", response.status)
            span.end()

            return response
        },
    )
}

global.fetch = fetcher

console.log("Instrumentation enabled")
