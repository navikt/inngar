import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router"
import "@navikt/ds-css"

import type { Route } from "./+types/root"
import stylesheet from "./app.css?url"
import { Alert } from "@navikt/ds-react"
import { logger } from "~/logger"
import Decorator from "~/components/decorator"
import { createContext, useContext, useState } from "react"
import { importSubApp } from "~/util/importUtil"
import Visittkort from "~/components/visittkort"

export const loader = () => {
    if (import.meta.env.DEV) {
        import("./mock/setupMockServer.server")
    }
}

export const links: Route.LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
    { rel: "stylesheet", href: stylesheet },
]

export const clientLoader = () => {
    importSubApp("https://cdn.nav.no/poao/veilarbvisittkortfs-dev/build")
}

type FnrState =
    | { loading: true }
    | { loading: false; fnr?: string | undefined | null }

const FnrProvider = createContext<FnrState>({ loading: true })
export const useFnrState = () => useContext(FnrProvider)

export function Layout({ children }: { children: React.ReactNode }) {
    const [fnrState, setState] = useState<FnrState>({ loading: true })

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body>
                <Decorator
                    onFnrChanged={(fnr) => {
                        setState({ loading: false, fnr })
                    }}
                />
                <FnrProvider.Provider value={fnrState}>
                    <Visittkort />
                    {children}
                </FnrProvider.Provider>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    )
}

export default function App() {
    return (
        <>
            <Outlet />
            <script src="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/dev/latest/dist/bundle.js"></script>
            <link
                rel="stylesheet"
                href="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/dev/latest/dist/index.css"
            />
        </>
    )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
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
