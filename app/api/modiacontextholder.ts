import { type FetchError, resilientFetch } from "~/util/resilientFetch"
import { contextUrl, generateFnrCodeUrl, retrieveFnrUrl } from "~/config"
import { logger } from "../../server/logger"
import { getOboToken } from "~/util/tokenExchange.server"
import { apps } from "~/util/appConstants"

type Fnr = string
type Code = string

interface FnrFromCodeResponse {
    fnr: "string"
    code: "string"
}

const setFnrIContextHolder = async (fnr: Fnr, request: Request) => {
    const payload = {
        verdi: fnr,
        eventType: "NY_AKTIV_BRUKER",
    }
    // const requestInit = new Request(request)
    const oboToken = await getOboToken(request, apps.modiacontextholder)
    if (oboToken.ok) {
        return resilientFetch(contextUrl, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                Authorization: `Bearer ${oboToken.token}`,
                ["Nav-Consumer-Id"]: "inngar",
                ["Content-Type"]: "application/json",
            },
        })
    } else {
        logger.error(
            `Fikk ikke bruker i kontekst (On-Behalf-Of mot kontekstholder feilet) : ${oboToken.errorResponse}`,
        )
        return {
            ok: false,
            error: new Error(
                "Fikk ikke bruker i kontekst (On-Behalf-Of mot kontekstholder feilet)",
            ),
            type: "FetchError",
        } as FetchError
    }
}

const getFnrFromCode = async (code: Code) => {
    return await resilientFetch<FnrFromCodeResponse>(retrieveFnrUrl, {
        method: "POST",
        body: JSON.stringify({ code }),
        headers: {
            ["Nav-Consumer-Id"]: "inngar",
            ["Content-Type"]: "application/json",
        },
    })
}

const generateForFnr = async (fnr: Fnr): Promise<Code | null> => {
    const result = await resilientFetch<FnrFromCodeResponse>(
        generateFnrCodeUrl,
        {
            method: "POST",
            body: JSON.stringify({ fnr }),
            headers: {
                ["Nav-Consumer-Id"]: "inngar",
                ["Content-Type"]: "application/json",
            },
        },
    )
    if (result.ok) {
        return result.data.code
    } else {
        logger.error(
            `Klarte ikke å generere code for fnr: ${result.error.toString()}`,
        )
        return null
    }
}

export const ModiacontextholderApi = {
    getFnrFromCode,
    generateForFnr,
    setFnrIContextHolder,
}
