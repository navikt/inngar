import type { Route } from "../../.react-router/types/app/routes/+types/dekoratorProxy"
import { logger } from "~/logger"

const mapTilApp = {
    veilarboppfolging: { name: "veilarboppfolging", namespace: "poao" },
    veilarbportefolje: { name: "veilarbportefolje", namespace: "obo" },
    veilarbperson: { name: "veilarbperson", namespace: "obo" },
    veilarbdialog: { name: "veilarbdialog", namespace: "dab" },
}

const getTargetApp = (url: URL) =>
    mapTilApp[new URL(url).pathname.split("/")[1] as keyof typeof mapTilApp]

const toUrl = (
    targetApp: { name: string; namespace: string },
    url: URL,
): string => {
    return `http://${targetApp.namespace}.${targetApp.name}${url.pathname}`
}

export async function loader({ request }: Route.LoaderArgs) {
    const fromUrl = new URL(request.url)
    const targetApp = getTargetApp(fromUrl)
    const url = toUrl(targetApp, fromUrl)
    try {
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
    const fromUrl = new URL(request.url)
    const targetApp = getTargetApp(fromUrl)
    const url = toUrl(targetApp, fromUrl)
    try {
        logger.info(`Videresender veilarbkall til: ${url}`)
        const newRequest = new Request(url, new Request(request))
        return await fetch(newRequest)
    } catch (e) {
        logger.error(`Veilarb kall feilet ${url}`)
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
