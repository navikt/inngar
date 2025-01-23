import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
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
import { DefaultErrorBoundry } from "~/components/DefaultErrorBoundary"

export const loader = async () => {
    if (import.meta.env.DEV) {
        import("./mock/setupMockServer.server")
    }
    const { cssUrl, jsUrl } = await importSubApp(
        "https://cdn.nav.no/poao/veilarbvisittkortfs-dev/build",
    )
    return { cssUrl, jsUrl }
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

// export const clientLoader = () => {
// importSubApp("https://cdn.nav.no/poao/veilarbvisittkortfs-dev/build")
// }

type FnrState =
    | { loading: true }
    | { loading: false; fnr?: string | undefined | null }

const FnrProvider = createContext<FnrState>({ loading: true })
export const useFnrState = () => useContext(FnrProvider)

export function Layout({ children }: { children: React.ReactNode }) {
    const { cssUrl, jsUrl } = useLoaderData()
    const [fnrState, setState] = useState<FnrState>({ loading: true })

    return (
        <html lang="en" className="bg-bg-subtle">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
                <link rel="stylesheet" href={cssUrl} />
                <script src={jsUrl} type="module" />
                <script src="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/dev/latest/dist/bundle.js"></script>
                <link
                    rel="stylesheet"
                    href="https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/dev/latest/dist/index.css"
                />
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
    return <Outlet />
}

export const ErrorBoundry = DefaultErrorBoundry
