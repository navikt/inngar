import { getToken, requestOboToken, validateToken } from "@navikt/oasis"
import type { App } from "~/util/appConstants"
import * as process from "node:process"

const scopeFrom = (app: App) =>
    `api://${cluster}.${app.namespace}.${app.name}/.default`

const cluster = process.env.NAIS_CLUSTER_NAME || "local"

export const headersWithAuth = (token: string) => {
    return {
        ["Nav-Consumer-Id"]: "inngar",
        Authorization: `Bearer ${token}`,
        ["Content-Type"]: "application/json",
    }
}

export const oboExchange = async (request: Request, app: App) => {
    let tokenResult = await getOboToken(request, app)
    if (!tokenResult.ok) {
        return tokenResult.errorResponse
    }

    return new Request(request, {
        headers: headersWithAuth(tokenResult.token),
    })
}

type OboResult =
    | { ok: true; token: string }
    | { ok: false; errorResponse: Response }

export const getOboToken = async (
    request: Request,
    app: App,
): Promise<OboResult> => {
    if (process.env.NODE_ENV == "development") {
        return { ok: true, token: "token" }
    }
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
