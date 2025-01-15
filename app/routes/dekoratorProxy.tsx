import type { Route } from "./+types/dekoratorProxy"
import { logger } from "../logger"

const target = "http://modiacontextholder.personoversikt"

const toContextHolderUrl = (urlString: string): string => {
    const url = new URL(urlString)
    return `${target}${url.pathname}`
}

export async function loader({ request }: Route.LoaderArgs) {
    try {
        const decoratorUrl = toContextHolderUrl(request.url)
        logger.info(`Videresender contextholderkall til: ${decoratorUrl}`)
        const newRequest = new Request(decoratorUrl, new Request(request))
        return await fetch(newRequest).then((proxyResponse) => {
            if (!proxyResponse.ok) {
                logger.error("Dårlig respons", proxyResponse)
            }
            return proxyResponse
        })
    } catch (e) {
        logger.error(`Fikk ikke svar fra modiacontextholder: ${e.toString()}`)
        return new Response("Internal server error", { status: 500 })
    }
}

export async function action({ request }: Route.ActionArgs) {
    const decoratorUrl = toContextHolderUrl(request.url)
    logger.info(`Videresender contextholderkall til: ${decoratorUrl}`)
    const newRequest = new Request(decoratorUrl, new Request(request))
    return await fetch(newRequest)
}

export function handleError(
    error: unknown,
    { request }: Route.ActionArgs | Route.LoaderArgs,
) {
    if (!request.signal.aborted) {
        logger.error(error)
    }
}
