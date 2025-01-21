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
const scopeFrom = (app: App) =>
    `api://${cluster}.${app.namespace}.${app.name}/.default`

const getTargetApp = (url: URL) =>
    mapTilApp[new URL(url).pathname.split("/")[1] as keyof typeof mapTilApp]

const toUrl = (targetApp: App, url: URL): string => {
    return `http://${targetApp.name}.${targetApp.namespace}${url.pathname}`
}

const oboExchange = async (request: Request, app: App) => {
    const token = getToken(request)
    if (!token) return new Response("Unauthorized", { status: 401 })
    const validation = await validateToken(token)
    if (!validation.ok) return new Response("Forbidden", { status: 403 })
    const oboToken = await requestOboToken(token, scopeFrom(app))
    if (!oboToken.ok) return new Response("Forbidden", { status: 403 })
    const fromUrl = new URL(request.url)
    return new Request(toUrl(app, fromUrl), {
        ...request,
        headers: {
            ...request.headers,
            Authorization: `Bearer ${oboToken.token}`,
        },
    })
}

export async function loader({ request }: Route.LoaderArgs) {
    const fromUrl = new URL(request.url)
    const targetApp = getTargetApp(fromUrl)
    const url = toUrl(targetApp, fromUrl)
    try {
        const responseOrRequest = await oboExchange(request, targetApp)
        if ("method" in responseOrRequest) {
            logger.info(`${responseOrRequest.method} ${responseOrRequest.url}`)
            return await fetch(responseOrRequest).then(async (proxyResponse) => {
                if (!proxyResponse.ok) {
                    logger.error(`Dårlig respons ${proxyResponse.status}`, await proxyResponse.text())
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
            logger.info(`${responseOrRequest.method} ${responseOrRequest.url}`)
            return await fetch(responseOrRequest).then(async (proxyResponse) => {
                if (!proxyResponse.ok) {
                    logger.error(`Dårlig respons ${proxyResponse.status}`, await proxyResponse.text())
                }
                return proxyResponse
            })
        } else {
            return responseOrRequest
        }
    } catch (e: Error) {
        logger.error(`Veilarb kall feilet ${url}: ${e.toString()}`)
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
