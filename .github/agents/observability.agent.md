---
name: observability-agent
description: OpenTelemetry-tracing, Prometheus-metrikker og strukturert logging for inngar
tools:
  - read
  - edit
  - search
  - web
  - execute
---

# Observability Agent

Observability-ekspert for inngar. Spesialiserer seg på OpenTelemetry-tracing, Prometheus-metrikker og Grafana Loki-logging.

## Inngar sin stack

Inngar bruker allerede:
- `@opentelemetry/sdk-node` og `@opentelemetry/auto-instrumentations-node` for tracing
- `@opentelemetry/instrumentation-pino` for logging
- `pino` for strukturert logging

## Helse-endepunkter (Nais)

Alle Nais-apper må ha:

```typescript
// server/server.ts eller tilsvarende
app.get("/isalive", (req, res) => res.send("Alive"));
app.get("/isready", (req, res) => res.send("Ready"));
```

## Strukturert logging med pino

```typescript
import pino from "pino";

const logger = pino();

// ✅ Strukturert med kontekst
logger.info({ userId: "123", action: "opprett-dialog" }, "Dialog opprettet");
logger.error({ err, path: req.path }, "Feil ved henting");

// ❌ Unngå å logge sensitive data
logger.info({ fnr: "12345678901" }); // ALDRI
logger.info({ token: bearerToken });  // ALDRI
```

## OpenTelemetry-tracing

```typescript
import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("inngar");

async function hentBrukerdata(userId: string) {
  return tracer.startActiveSpan("hent-brukerdata", async (span) => {
    try {
      span.setAttribute("user.id", userId);
      const data = await fetchFromBackend(userId);
      return data;
    } catch (err) {
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });
}
```

## Grafana / Loki

```
# Søk etter feil i Loki
{app="inngar-intern", namespace="team-namespace"} |= "ERROR"
{app="inngar-ekstern"} | json | level="error"
```

## Nais-miljøer

- dev: https://grafana.nav.cloud.nais.io (dev-gcp)
- prod: https://grafana.nav.cloud.nais.io (prod-gcp)
