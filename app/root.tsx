import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useFetcher,
    useLoaderData,
} from "react-router"
import "@navikt/ds-css"

import type { Route } from "./+types/root"
import stylesheet from "./app.css?url"
import Decorator from "~/components/decorator"
import { useState } from "react"
import { importSubApp } from "~/util/importUtil"
import Visittkort from "~/components/visittkort"
import { MockSettingsForm } from "~/mock/MockSettingsForm"
import { mockSettings } from "~/mock/mockSettings"
import { startActiveSpan } from "../server/onlyServerOtelUtils"

export const loader = async ({}: Route.LoaderArgs) => {
    let other = {}
    if (import.meta.env.DEV) {
        other = { mockSettings }
    }
    return startActiveSpan(`loader - root`, async () => {
        // TODO: Dont use dev url
        const { cssUrl, jsUrl } = await importSubApp(
            "https://cdn.nav.no/poao/veilarbvisittkortfs-dev/build",
        )
        return { cssUrl, jsUrl, ...other }
    })
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

export type FnrState =
    | { loading: true }
    | { loading: false; fnr?: string | undefined | null }

export function Layout({ children }: { children: React.ReactNode }) {
    const { cssUrl, jsUrl } = useLoaderData()
    const [fnrState, setState] = useState<FnrState>({ loading: true })
    const fetcher = useFetcher()
    const reloadIndexPage = () => {
        const formData = new FormData()
        fetcher.submit(formData, { method: "POST", action: "/" })
    }

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
                        console.log("onFnrChanged", fnr)
                        if (!fnr) return

                        setState({ loading: false, fnr })
                        reloadIndexPage()
                    }}
                />
                <Visittkort fnrState={fnrState} />
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    )
}

export const action = () => {
    return new Response(undefined, { status: 201 })
}

export default function App({ loaderData }) {
    if (import.meta.env.DEV) {
        return (
            <>
                <MockSettingsForm mockSettings={loaderData.mockSettings} />
                <Outlet />
            </>
        )
    } else {
        return <Outlet />
    }
}
