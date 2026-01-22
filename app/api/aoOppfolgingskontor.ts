import { apps } from "~/util/appConstants.ts"
import { toUrl } from "~/api/utils.ts"
import { type FetchError, type HttpError, resilientFetch, type Success } from "~/util/resilientFetch.ts"

const baseUrl = toUrl(apps.aoOppfolgingskontor, "/api")

export interface Arbeidsoppfølgingskontor {
    kontorId: string,
    kontorNavn: string,
}

export const finnArbeidsoppfølgingskontor = (fnr: string, token: string): Promise<Success<Arbeidsoppfølgingskontor> | HttpError | FetchError> => {
    return resilientFetch<Arbeidsoppfølgingskontor>(
        `${baseUrl}/finn-kontor`,
        {
            method: "POST",
            body: JSON.stringify({ ident: fnr, erArbeidssøker: false }),
            headers: {
                ["Nav-Consumer-Id"]: "inngar",
                Authorization: `Bearer ${token}`,
                ["Content-Type"]: "application/json",
            },
        },
    )
}

export const AoOppfolgingskontorApi = {
    finnArbeidsoppfølgingskontor,
}
