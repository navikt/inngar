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
import { loadUmami, loggBesok } from "~/umami.client"
import { ModiacontextholderApi } from "~/api/modiacontextholder"
import process from "node:process"
import { getEnv } from "~/util/envUtil.ts"

const isProd = process.env.NAIS_CLUSTER_NAME === "prod-gcp"

export const loader = async ({}: Route.LoaderArgs) => {
    let other = {}
    if (import.meta.env.DEV) {
        other = { mockSettings }
    }
    return startActiveSpan(`loader - root`, async () => {
        // TODO: Dont use dev url
        const { cssUrl, jsUrl } = await importSubApp(
            `https://cdn.nav.no/poao/veilarbvisittkortfs-${isProd ? "prod" : "dev"}/build`,
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
    const env = getEnv()
    const isProd = env.type == "prod"

    const redirectToChangedUser = (fnr: string | null | undefined) => {
        const formData = new FormData()
        formData.set("fnr", fnr || "")
        formData.set("fnrCode", fnrCode ?? "")
        fetcher.submit(formData, { method: "POST", action: "/" })
    }

    useEffect(() => {
        loadUmami()
            .then(() => {
                loggBesok()
            })
            .catch((e) => {
                console.warn("Kunne ikke laste Umami-scriptet:", e)
            })
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
                <script
                    src={`https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/${isProd ? "prod" : "dev"}/latest/dist/bundle.js`}
                    defer
                />
                <link
                    rel="stylesheet"
                    href={`https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/${isProd ? "prod" : "dev"}/latest/dist/index.css`}
                />
            </head>
            <body>
                <Decorator
                    onFnrChanged={(fnr) => {
                        redirectToChangedUser(fnr)
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
    /* This is only called if fnr is changed after page-load */

    const formData = await request.formData()
    const fnr = formData.get("fnr") as string | null
    const fnrCode = formData.get("fnrCode") as string | null

    /* This means context was cleared explicitly after page-load */
    if (!fnr) {
        return redirect(`/`)
    } else {
        /* User changed to new fnr after page load */
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
