import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData, useNavigate
} from "react-router";
import "@navikt/ds-css"

import type { Route } from "./+types/root"
import stylesheet from "./app.css?url"
import Decorator from "~/components/decorator"
import { createContext, useContext, useState } from "react"
import { importSubApp } from "~/util/importUtil"
import Visittkort from "~/components/visittkort"
import { DefaultErrorBoundary } from "~/components/DefaultErrorBoundary"
import { MockSettingsForm } from "~/mock/MockSettingsForm";
import { mockSettings } from "~/mock/mockSettings"

export const loader = async ({ request }: Route.LoaderArgs) => {
    let other = {}
    if (import.meta.env.DEV) {
        import("./mock/setupMockServer.server")
        other = { mockSettings }
    }
    const { cssUrl, jsUrl } = await importSubApp(
        "https://cdn.nav.no/poao/veilarbvisittkortfs-dev/build",
    )
    return { cssUrl, jsUrl, ...other }
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
    const navigate = useNavigate()

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
                        console.log("Navigating because visittkort fnr change")
                        navigate(".", { replace: true })
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

export default function App({ loaderData }) {
    if (import.meta.env.DEV) {
        return <>
            <MockSettingsForm mockSettings={loaderData.mockSettings} />
            <Outlet />
        </>
    } else {
        return <Outlet />
    }

}

// export const ErrorBoundary = DefaultErrorBoundary
