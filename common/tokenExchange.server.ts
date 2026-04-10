import { getToken, requestOboToken, validateToken } from "@navikt/oasis"
import type { App } from "./appConstants.ts"
import * as process from "node:process"
import { logger } from "./logger.ts"

const cluster = process.env.NAIS_CLUSTER_NAME || "local"

const azureScopeFrom = (app: App) =>
    `api://${cluster}.${app.namespace}.${app.name}/.default`

const tokenXScopeFrom = (app: App) =>
    `${cluster}:${app.namespace}:${app.name}`

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
    if (!validation.ok) {
        logger.error("Validering av token feilet")
        return {
            errorResponse: new Response("Forbidden", { status: 403 }),
            ok: false,
        }
    }

    const isTokenX = validation.payload.iss?.includes("tokenx") ?? false
    const scope = isTokenX ? tokenXScopeFrom(app) : azureScopeFrom(app)

    const oboToken = await requestOboToken(token, scope)
    if (!oboToken.ok) {
        logger.error("Kunne ikke hente OBO-token")
        return {
            errorResponse: new Response("Forbidden", { status: 403 }),
            ok: false,
        }
    }

    return { token: oboToken.token, ok: true }
}
