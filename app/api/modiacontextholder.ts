import { resilientFetch } from "~/util/resilientFetch"
import { contextUrl, generateFnrCodeUrl, retrieveFnrUrl } from "~/config"
import { logger } from "../../server/logger"

type Fnr = string
type Code = string

interface FnrFromCodeResponse {
    fnr: "string"
    code: "string"
}

const setFnrIContextHolder = async (fnr: Fnr) => {
    const payload = {
        verdi: fnr,
        eventType: "NY_AKTIV_BRUKER",
    }
    return resilientFetch(contextUrl, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            ["Nav-Consumer-Id"]: "inngar",
            ["Content-Type"]: "application/json",
        },
    })
}

const getFnrFromCode = async (code: Code) => {
    return await resilientFetch<FnrFromCodeResponse>(retrieveFnrUrl, {
        method: "POST",
        body: JSON.stringify({ code }),
        headers: {
            ["Nav-Consumer-Id"]: "inngar",
            ["Content-Type"]: "application/json",
        },
    }).then((result) => {
        return result
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
