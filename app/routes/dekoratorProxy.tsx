import type { Route } from "./+types/dekoratorProxy"
import { logger } from "../logger"

const target = "http://modiacontextholder.personoversikt"

export async function loader({ request }: Route.LoaderArgs) {
    try {
        const newUrl = new URL(request.url)
        newUrl.host = target

        const newRequest = new Request(newUrl.toString(), new Request(request))
        return await fetch(newRequest).then((res) => {
            if (!res.ok) {
                logger.error("Dårlig respons", res)
            }
            return res
        })
    } catch (e) {
        logger.error(`Fikk ikke svar fra modiacontextholder: ${e.toString()}`)
        return new Response("Internal server error", { status: 500 })
    }
}

export async function action({ request }: Route.ActionArgs) {
    const newUrl = new URL(request.url)
    newUrl.host = target
    logger.info(`Videresender contextholderkall til: ${newUrl.toString()}`)
    const newRequest = new Request(newUrl.toString(), new Request(request))
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
