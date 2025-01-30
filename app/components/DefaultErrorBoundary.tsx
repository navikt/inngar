import type { Route } from "../../.react-router/types/app/routes/+types"
import { isRouteErrorResponse } from "react-router"
import { Alert } from "@navikt/ds-react"
import { logger } from "../../server/logger"

export function DefaultErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let errorTitle = "Oops!"
    let details = "An unexpected error occurred."
    let stack: string | undefined

    if (isRouteErrorResponse(error)) {
        // console.log("erorr data", JSON.stringify(error.data))
        errorTitle = error.data?.errorTitle || 'Oops!'
        details = error.data?.message || error.data?.errorMessage
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error?.message
        stack = error.stack
    }

    // console.log("error",error)
    logger.error(`Noe gikk veldig galt i root.tsx: ${JSON.stringify(error)}`)

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>{errorTitle}</h1>
            <Alert variant="error">
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
