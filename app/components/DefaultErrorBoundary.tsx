import type { Route } from "../../.react-router/types/app/routes/+types"
import { isRouteErrorResponse } from "react-router"
import { logger } from "../../server/logger"
import { XMarkOctagonIcon } from "@navikt/aksel-icons"

export function DefaultErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let errorTitle = "Oops!"
    let details = "An unexpected error occurred."
    let stack: string | undefined

    if (isRouteErrorResponse(error)) {
        errorTitle = error.data?.errorTitle || 'Oops!'
        details = error.data?.message || error?.data?.stack || error.data?.errorMessage
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error?.message
        stack = error?.stack
    }

    logger.error(`Noe gikk veldig galt i root.tsx: ${JSON.stringify(error)}`)
    if (import.meta.env.DEV) {
        if (error instanceof Error) {
            logger.error(error.stack)
        } else {
            const stack = error?.stack || error.data?.stack
            logger.error(stack)
        }
    }

    const traceId = error?.data?.traceId

    return (
        <main className="pt-16 p-4 container mx-auto">
            <div className="flex items-center space-x-4">
                <XMarkOctagonIcon fontSize="36" className="text-red-600" />
                <h1>{errorTitle}</h1>
            </div>
            {
                traceId ? <div className=" mb-2 p-2 font-mono rounded">
                    <p>TraceId: {traceId}</p>
                </div> : null
            }
            <div>
                <p>{details}</p>
                {stack && (
                    <pre className="w-full p-4 overflow-x-auto">
                        <code>{stack}</code>
                    </pre>
                )}
            </div>
        </main>
    )
}
