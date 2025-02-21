import {
    Links,
    Meta,
    Outlet,
    redirect,
    Scripts,
    ScrollRestoration,
    useFetcher,
    useLoaderData,
    useParams,
} from "react-router"
import "@navikt/ds-css"

import type { Route } from "./+types/root"
import stylesheet from "./app.css?url"
import Decorator from "~/components/Decorator"
import { importSubApp } from "~/util/importUtil"
import { MockSettingsForm } from "~/mock/MockSettingsForm"
import { mockSettings } from "~/mock/mockSettings"
import { startActiveSpan } from "../server/onlyServerOtelUtils"
import { useEffect } from "react"
import { loggBesok } from "~/amplitude.client"
import { ModiacontextholderApi } from "~/api/modiacontextholder"

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
    const fetcher = useFetcher()
    const { fnrCode } = useParams()
    const reloadIndexPage = (fnr: string | null | undefined) => {
        const formData = new FormData()
        formData.set("fnr", fnr || "")
        formData.set("fnrCode", fnrCode || "")
        fetcher.submit(formData, { method: "POST", action: "/" })
    }

    useEffect(() => {
        loggBesok()
    }, [])

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
                        reloadIndexPage(fnr)
                    }}
                />

                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    )
}

export const action = async ({
    request,
    context,
    params,
}: Route.ActionArgs) => {
    const formData = await request.formData()
    const fnr = formData.get("fnr") as string | null
    const fnrCode = formData.get("fnrCode") as string | null

    // Navigated to url with fnr but context has no user
    if (!fnr && fnrCode) {
        return redirect(`/`)
    } else if (!fnr) {
        // No user in context and no fnr in request
        return new Response(undefined, { status: 201 })
    } else {
        // FnrCode in url and fnr in context, use fnr in context and redirect to /:code for that fnr
        const code = await ModiacontextholderApi.generateForFnr(fnr)
        if (code) {
            return redirect(`/${code}`)
        } else {
            // Fallback if something went wrong
            return redirect(`/`)
        }
    }
}

export default function App({ loaderData }: Route.ComponentProps) {
    if (import.meta.env.DEV) {
        return (
            <>
                <MockSettingsForm
                    mockSettings={(loaderData as any).mockSettings}
                />
                <Outlet />
            </>
        )
    } else {
        return <Outlet />
    }
}
