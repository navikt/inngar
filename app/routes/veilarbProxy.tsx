import type { Route } from "../../.react-router/types/app/routes/+types/dekoratorProxy"
import { logger } from "~/logger"
import { getToken, requestOboToken, validateToken } from "@navikt/oasis"

interface App {
    name: string
    namespace: string
}
const mapTilApp = {
    veilarboppfolging: { name: "veilarboppfolging", namespace: "poao" },
    veilarbportefolje: { name: "veilarbportefolje", namespace: "obo" },
    veilarbperson: { name: "veilarbperson", namespace: "obo" },
    veilarbdialog: { name: "veilarbdialog", namespace: "dab" },
}

const cluster = process.env.NAIS_CLUSTER_NAME || "local"
const scopeFrom = (app: App) => `${cluster}:${app.name}:${app.namespace}`

const getTargetApp = (url: URL) =>
    mapTilApp[new URL(url).pathname.split("/")[1] as keyof typeof mapTilApp]

const toUrl = (targetApp: App, url: URL): string => {
    return `http://${targetApp.namespace}.${targetApp.name}${url.pathname}`
}

const oboExchange = async (request: Request, app: App) => {
    const token = getToken(request)
    if (!token) return new Response("Unauthorized", { status: 401 })
    const validation = await validateToken(token)
    if (!validation.ok) return new Response("Forbidden", { status: 403 })
    const oboToken = await requestOboToken(token, scopeFrom(app))
    const fromUrl = new URL(request.url)
    return new Request(toUrl(app, fromUrl), {
        ...request,
        headers: { ...request.headers, Authorization: `Bearer ${oboToken}` },
    })
}

export async function loader({ request }: Route.LoaderArgs) {
    const fromUrl = new URL(request.url)
    const targetApp = getTargetApp(fromUrl)
    const url = toUrl(targetApp, fromUrl)
    try {
        logger.info(`Videresender veilarb til: ${url}`)
        const responseOrRequest = await oboExchange(request, targetApp)
        if ("method" in responseOrRequest) {
            return await fetch(responseOrRequest).then((proxyResponse) => {
                if (!proxyResponse.ok) {
                    logger.error("Dårlig respons", proxyResponse)
                }
                return proxyResponse
            })
        } else {
            return responseOrRequest
        }
    } catch (e) {
        logger.error(`Fikk ikke svar fra ${targetApp}}: ${e.toString()}`)
        return new Response("Internal server error", { status: 500 })
    }
}

export async function action({ request }: Route.ActionArgs) {
    const fromUrl = new URL(request.url)
    const targetApp = getTargetApp(fromUrl)
    const url = toUrl(targetApp, fromUrl)
    try {
        logger.info(`Videresender veilarb til: ${url}`)
        const responseOrRequest = await oboExchange(request, targetApp)
        if ("method" in responseOrRequest) {
            return await fetch(responseOrRequest).then((proxyResponse) => {
                if (!proxyResponse.ok) {
                    logger.error("Dårlig respons", proxyResponse)
                }
                return proxyResponse
            })
        } else {
            return responseOrRequest
        }
    } catch (e) {
        logger.error(`Veilarb kall feilet ${url}`, e)
        return new Response("Internal server error", { status: 500 })
    }
}

export function handleError(
    error: unknown,
    { request }: Route.ActionArgs | Route.LoaderArgs,
) {
    if (!request.signal.aborted) {
        logger.error(error)
    }
}
