import type { Route } from "../../.react-router/types/app/routes/+types"
import { isRouteErrorResponse } from "react-router"
import { logger } from "../../server/logger"
import { XMarkOctagonIcon } from "@navikt/aksel-icons"
import { ReadMore } from "@navikt/ds-react"

export function DefaultErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let errorTitle = "Oops!"
    let details = "An unexpected error occurred."
    let stack: string | undefined
    let traceId: string | undefined

    if (isRouteErrorResponse(error)) {
        errorTitle = error.data?.errorTitle || "Oops!"
        details = error.data?.errorMessage
        traceId = error?.data?.traceId
        stack = error?.data?.stack
    } else if (error && error instanceof Error) {
        details = error?.message
        stack = error?.stack
    }

    if (error instanceof Error) {
        logger.error(error.stack)
    } else {
        if (stack) {
            logger.error(stack)
        } else {
            logger.error("Error (no stack found):", error)
        }
    }
    logger.error(`Noe gikk veldig galt: ${JSON.stringify(error)}`)
    logger.error(`Noe gikk veldig galt (error uten stringify): `, error)

    return (
        <main className="flex flex-col w-[620px] p-4 mx-auto space-y-4">
            <div className="flex items-center space-x-4">
                <XMarkOctagonIcon fontSize="36" className="text-red-600" />
                <h1>{errorTitle}</h1>
            </div>
            {traceId ? (
                <div className=" mb-2 p-2 font-mono rounded">
                    <p>TraceId: {traceId}</p>
                </div>
            ) : null}
            <div>
                <p>{details}</p>
                {stack && (
                    <ReadMore header={"Stacktrace"}>
                        <pre className="w-full p-4 overflow-x-auto">
                            <code>{stack}</code>
                        </pre>
                    </ReadMore>
                )}
            </div>
        </main>
    )
}
