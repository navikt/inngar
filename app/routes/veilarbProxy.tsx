import type { Route } from "../../.react-router/types/app/routes/+types/dekoratorProxy"
import { logger } from "~/logger"
import { oboExchange } from "~/util/tokenExchange.server"
import { type App, apps } from "~/util/appConstants"

const getTargetApp = (url: URL) =>
    apps[new URL(url).pathname.split("/")[1] as keyof typeof apps]

const toUrl = (targetApp: App, url: URL): string => {
    return `http://${targetApp.name}.${targetApp.namespace}${url.pathname}`
}

export async function loader({ request }: Route.LoaderArgs) {
    const fromUrl = new URL(request.url)
    const targetApp = getTargetApp(fromUrl)
    const url = toUrl(targetApp, fromUrl)
    try {
        const responseOrRequest = await oboExchange(request, targetApp)
        if ("method" in responseOrRequest) {
            logger.info(`${responseOrRequest.method} ${url}`)
            return await fetch(url, responseOrRequest).then(
                async (proxyResponse) => {
                    if (!proxyResponse.ok) {
                        logger.error(
                            `Dårlig respons ${proxyResponse.status} - ${!proxyResponse.bodyUsed ? await proxyResponse.text() : ""}`
                        )
                    }
                    return proxyResponse
                },
            )
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
        const responseOrRequest = await oboExchange(request, targetApp)
        if ("method" in responseOrRequest) {
            logger.info(`${responseOrRequest.method} ${url}`)
            return await fetch(url, responseOrRequest).then(
                async (proxyResponse) => {
                    if (!proxyResponse.ok) {
                        logger.error(
                            `Dårlig respons ${proxyResponse.status} - ${!proxyResponse.bodyUsed ? await proxyResponse.text() : ""}`
                        )
                    }
                    return proxyResponse
                },
            )
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
