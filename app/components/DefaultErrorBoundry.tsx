import type { Route } from "../../.react-router/types/app/routes/+types";
import { isRouteErrorResponse } from "react-router";
import { logger } from "~/logger";
import { Alert } from "@navikt/ds-react";

export function DefaultErrorBoundry({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error"
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error?.message
    stack = error.stack
  }

  details = error.data?.message

  logger.error("Noe gikk veldig galt i root.tsx")

  return (
    <main className="pt-16 p-4 container mx-auto">
      <Alert variant="error">
        <h1>{message}</h1>
        <p>{details}</p>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto">
                        <code>{stack}</code>
                    </pre>
        )}
      </Alert>
    </main>
  )
}