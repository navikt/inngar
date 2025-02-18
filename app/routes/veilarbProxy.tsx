import type { Route } from "../../.react-router/types/app/routes/+types/dekoratorProxy"
import { oboExchange } from "~/util/tokenExchange.server"
import { type App, apps } from "~/util/appConstants"
import { logger } from "../../server/logger"

const getTargetApp = (url: URL) =>
    apps[new URL(url).pathname.split("/")[1] as keyof typeof apps]

const toUrl = (targetApp: App, url: URL): string => {
    const path = targetApp.preserveContextPath
        ? url.pathname // "/obo-unleash/api/lol
        : url.pathname.replace(`/${targetApp.name}`, "") // "</obo-unleash>/api/lol -> /api/lol
    return `http://${targetApp.name}.${targetApp.namespace}${path}${url.search}`
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
                        const body = !proxyResponse.bodyUsed
                            ? await proxyResponse.text()
                            : ""
                        logger.error(
                            `Dårlig respons ${proxyResponse.status} - ${body}`,
                        )
                        return new Response(body, {
                            status: proxyResponse.status,
                            headers: proxyResponse.headers,
                        })
                    } else {
                        return proxyResponse
                    }
                },
            )
        } else {
            logger.info(`Failed OBO exchange for ${targetApp.name}`)
            return responseOrRequest
        }
    } catch (e) {
        logger.error(`Fikk ikke svar fra ${targetApp.name}}: ${e.toString()}`)
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
                        const body = !proxyResponse.bodyUsed
                            ? await proxyResponse.text()
                            : ""
                        logger.error(
                            `Dårlig respons ${proxyResponse.status} - ${body}`,
                        )
                        return new Response(body, {
                            status: proxyResponse.status,
                            headers: proxyResponse.headers,
                        })
                    } else {
                        return proxyResponse
                    }
                },
            )
        } else {
            logger.info(`Failed OBO exchange for ${targetApp.name}`)
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
