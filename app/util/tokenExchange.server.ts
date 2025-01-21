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
    let tokenResult = await getOboToken(request, app)
    if (!tokenResult.ok) {
        return tokenResult.errorResponse
    }

    return new Request(request, {
        headers: {
            ["Nav-Consumer-Id"]: "inngar",
            Authorization: `Bearer ${tokenResult.token}`,
            ["Content-Type"]: "application/json",
        },
    })
}

export const getOboToken = async (request: Request, app: App) => {
    const token = getToken(request)
    if (!token)
        return {
            errorResponse: new Response("Unauthorized", { status: 401 }),
            ok: false,
        }
    const validation = await validateToken(token)
    if (!validation.ok)
        return {
            errorResponse: new Response("Forbidden", { status: 403 }),
            ok: false,
        }
    const oboToken = await requestOboToken(token, scopeFrom(app))
    if (!oboToken.ok)
        return {
            errorResponse: new Response("Forbidden", { status: 403 }),
            ok: false,
        }

    return { token: oboToken.token, ok: true }
}
