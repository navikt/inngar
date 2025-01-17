import type { Route } from "../../.react-router/types/app/routes/+types/dekoratorProxy"
import { logger } from "~/logger"

const mapTilApp = {
    veilarboppfolging: { name: "veilarboppfolging", namespace: "poao" },
    veilarbportefolje: { name: "veilarbportefolje", namespace: "obo" },
    veilarbperson: { name: "veilarbperson", namespace: "obo" },
    veilarbdialog: { name: "veilarbdialog", namespace: "dab" },
}

const getTargetApp = (request: Request) =>
    mapTilApp[
        new URL(request.url).pathname.split("/")[1] as keyof typeof mapTilApp
    ]

const toUrl = (targetApp: { name: string; namespace: string }): string => {
    return `http://${targetApp.namespace}.${targetApp.name}`
}

export async function loader({ request }: Route.LoaderArgs) {
    const targetApp = getTargetApp(request)
    try {
        const url = toUrl(targetApp)
        logger.info(`Videresender veilarb til: ${url}`)
        const newRequest = new Request(url, new Request(request))
        return await fetch(newRequest).then((proxyResponse) => {
            if (!proxyResponse.ok) {
                logger.error("Dårlig respons", proxyResponse)
            }
            return proxyResponse
        })
    } catch (e) {
        logger.error(`Fikk ikke svar fra ${targetApp}}: ${e.toString()}`)
        return new Response("Internal server error", { status: 500 })
    }
}

export async function action({ request }: Route.ActionArgs) {
    const targetApp = getTargetApp(request)
    const url = toUrl(targetApp)
    logger.info(`Videresender veilarbkall til: ${url}`)
    const newRequest = new Request(url, new Request(request))
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
