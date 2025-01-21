import { getToken, requestOboToken, validateToken } from "@navikt/oasis"

export interface App {
    name: string
    namespace: string
}

export const mapTilApp = {
    veilarboppfolging: { name: "veilarboppfolging", namespace: "poao" },
    veilarbportefolje: { name: "veilarbportefolje", namespace: "obo" },
    veilarbperson: { name: "veilarbperson", namespace: "obo" },
    veilarbdialog: { name: "veilarbdialog", namespace: "dab" },
}

const scopeFrom = (app: App) =>
    `api://${cluster}.${app.namespace}.${app.name}/.default`

const cluster = process.env.NAIS_CLUSTER_NAME || "local"

export const oboExchange = async (request: Request, app: App) => {
    const token = getToken(request)
    if (!token) return new Response("Unauthorized", { status: 401 })
    const validation = await validateToken(token)
    if (!validation.ok) return new Response("Forbidden", { status: 403 })
    const oboToken = await requestOboToken(token, scopeFrom(app))
    if (!oboToken.ok) return new Response("Forbidden", { status: 403 })

    return new Request(request, {
        headers: {
            ["Nav-Consumer-Id"]: "inngar",
            Authorization: `Bearer ${oboToken.token}`,
            ["Content-Type"]: "application/json",
        },
    })
}
