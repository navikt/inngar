import { resilientFetch } from "~/util/resilientFetch"
import { generateFnrCodeUrl, retrieveFnrUrl } from "~/config"
import { logger } from "../../server/logger"

type Fnr = string
type Code = string

interface FnrFromCodeResponse {
    fnr: "string"
    code: "string"
}

const getFnrFromCode = async (code: Code) => {
    return await resilientFetch<FnrFromCodeResponse>(retrieveFnrUrl, {
        method: "POST",
        body: JSON.stringify({ code }),
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
        },
    )
    if (result.ok) {
        return result.data.code
    } else {
        logger.error("Klarte ikke å generere code for fnr", result.error)
        return null
    }
}

export const ModiacontextholderApi = {
    getFnrFromCode,
    generateForFnr,
}
