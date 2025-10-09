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
import { useEffect, useState } from "react"
import { loggBesok } from "~/amplitude.client"
import { ModiacontextholderApi } from "~/api/modiacontextholder"
import process from "node:process"
import { VisittkortLoading } from "~/components/Visittkort.tsx"

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

type Intent =
    | "CLEAR_CONTEXT"
    | "GENERATE_FNR_CODE"
    | "FETCH_FNR_FOR_CODE"
    | "INGORE"

const getIntent = (
    fnr: string | undefined | null,
    fnrCode: string | undefined | null,
): Intent => {
    if (!fnr && !fnrCode) return "CLEAR_CONTEXT"
    if (fnr && !fnrCode) return "GENERATE_FNR_CODE"
    if (!fnr && fnrCode) return "FETCH_FNR_FOR_CODE"
    if (fnr && fnrCode) return "INGORE"
    return "INGORE"
}

const nullIfEmpty = (value: string | null | undefined): string | null => {
    if (value === "" || value === undefined) {
        return null
    }
    return value
}

export function Layout({ children }: { children: React.ReactNode }) {
    const { cssUrl, jsUrl } = useLoaderData()
    const fetcher = useFetcher()
    const { fnrCode } = useParams()

    const [isLoadingUser, setIsLoadingUser] = useState(false)

    const onFnrChanged = (fnr: string | null | undefined) => {
        console.log("onFnrChanged", fnr)
        if (!fnrCode && fnr) {
            setIsLoadingUser(true)
        }

        const formData = new FormData()
        formData.set("fnr", fnr || "")
        formData.set(
            "intent",
            getIntent(nullIfEmpty(fnr), nullIfEmpty(fnrCode)),
        )
        fetcher.submit(formData, { method: "POST", action: "/" })
    }

    useEffect(() => {
        loggBesok()
    }, [])

    useEffect(() => {
        // If fnrCode is in url, is always means we are finished loading
        if (fnrCode) {
            setIsLoadingUser(false)
        }
    }, [fnrCode])

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
                <Decorator onFnrChanged={onFnrChanged} />
                {isLoadingUser ? <VisittkortLoading /> : null}
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
    const intent = formData.get("intent") as Intent

    switch (intent) {
        case "CLEAR_CONTEXT": {
            redirect("/")
            break
        }
        case "FETCH_FNR_FOR_CODE": {
            break
        }
        case "GENERATE_FNR_CODE": {
            const fnr = formData.get("fnr") as string
            const code = await ModiacontextholderApi.generateForFnr(fnr)
            if (code) {
                return redirect(`/${code}`)
            } else {
                // Fallback if something went wrong
                return redirect(`/`)
            }
        }
        default:
            break
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
