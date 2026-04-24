import { apps } from "common/appConstants.ts"
import { logger } from "common"
import {
    type FetchError,
    type HttpError,
    resilientFetch,
    type Success,
} from "~/util/resilientFetch"
import { toUrl } from "common/utils.ts"
import type {
    ArenaResponseKoder,
    StartOppfolgingErrorResponse,
    StartOppfolgingSuccess,
} from "common/startOppfolgingResponse.ts"

const reaktiverOppfolgingUrl = toUrl(
    apps.veilarboppfolging,
    "/veilarboppfolging/api/v3/oppfolging/reaktiver",
)

const startOppfolgingUrl = toUrl(
    apps.veilarboppfolging,
    "/veilarboppfolging/api/v3/oppfolging/startOppfolgingsperiode",
)

const graphqlUrl = toUrl(
    apps.veilarboppfolging,
    "/veilarboppfolging/api/graphql",
)

interface ReaktiverOppfolgingSuccessResponse {
    kode: ArenaResponseKoder
}

interface ReaktiverOppfolgingErrorResponse {
    ok: false
    error: string
}

interface ReaktiverOppfolgingSuccess {
    ok: true
    body: ReaktiverOppfolgingSuccessResponse
}

const reaktiverOppfolging = async (
    fnr: string,
    token: string,
): Promise<ReaktiverOppfolgingSuccess | ReaktiverOppfolgingErrorResponse> => {
    return await fetch(reaktiverOppfolgingUrl, {
        headers: {
            ["Nav-Consumer-Id"]: "inngar",
            Authorization: `Bearer ${token}`,
            ["Content-Type"]: "application/json",
        },
        body: JSON.stringify({ fnr }),
        method: "POST",
    })
        .then(async (proxyResponse: Response) => {
            if (!proxyResponse.ok && proxyResponse.status !== 409) {
                const body = !proxyResponse.bodyUsed
                    ? await proxyResponse.text()
                    : ""
                logger.error(
                    `Reaktiver oppfølging feilet med http-status: ${proxyResponse.status}`,
                )
                logger.error(`Reaktiver oppfølging feilet med melding ${body}`)
                return {
                    ok: false as const,
                    error: body,
                } as ReaktiverOppfolgingErrorResponse
            } else {
                logger.info("Oppfølging reaktivert")
                return {
                    ok: true as const,
                    body: await proxyResponse.json(),
                } as ReaktiverOppfolgingSuccess
            }
        })
        .catch((e: Error) => {
            logger.error(
                `Reaktiver oppfølging feilet (http kall feilet): ${e.toString()}`,
            )
            return {
                ok: false as const,
                error: "Reaktiver oppfølging feilet",
            } as ReaktiverOppfolgingErrorResponse
        })
}

const startOppfolging = async (
    fnr: string,
    token: string,
    kontorSattAvVeileder?: string,
): Promise<StartOppfolgingSuccess | StartOppfolgingErrorResponse> => {
    const body = {
        fnr,
        henviserSystem: "DEMO",
        kontorSattAvVeileder,
    }
    return await fetch(startOppfolgingUrl, {
        headers: {
            ["Nav-Consumer-Id"]: "inngar",
            Authorization: `Bearer ${token}`,
            ["Content-Type"]: "application/json",
        },
        body: JSON.stringify(body),
        method: "POST",
    })
        .then(async (proxyResponse: Response) => {
            if (!proxyResponse.ok && !(proxyResponse.status === 409)) {
                const body = !proxyResponse.bodyUsed
                    ? await proxyResponse.text()
                    : ""
                logger.error(
                    `Start oppfølging feilet med http-status: ${proxyResponse.status}`,
                )
                logger.error(`Start oppfølging feilet med melding ${body}`)
                return {
                    ok: false as const,
                    error: body,
                } as StartOppfolgingErrorResponse
            } else {
                logger.info("Oppfølging startet")
                return {
                    ok: true as const,
                    body: await proxyResponse.json(),
                } as StartOppfolgingSuccess
            }
        })
        .catch((e: Error) => {
            logger.error(
                `Start oppfølging feilet (http kall feilet): ${e.toString()}`,
            )
            return {
                ok: false as const,
                error: "Start oppfølging feilet",
            } as StartOppfolgingErrorResponse
        })
}

const query = `
  query($fnr: String!) {
    oppfolgingsEnhet(fnr: $fnr) {
        enhet {
            navn,
            id,
            kilde
        }
    }
    oppfolging(fnr: $fnr) {
        kanStarteOppfolging
    }
  }
`

const graphqlBody = (fnr: string) => ({
    query,
    variables: {
        fnr,
    },
})

interface Enhet {
    id: string
    navn: string
    kilde: string
}

export type KanIkkeStarteOppfolgingPgaIkkeTilgang =
    | "IKKE_TILGANG_FORTROLIG_ADRESSE"
    | "IKKE_TILGANG_STRENGT_FORTROLIG_ADRESSE"
    | "IKKE_TILGANG_EGNE_ANSATTE"
    | "IKKE_TILGANG_ENHET"
    | "IKKE_TILGANG_MODIA"
export type KanIkkeStartePgaFolkeregisterStatus =
    | "DOD"
    | "IKKE_LOVLIG_OPPHOLD"
    | "UKJENT_STATUS_FOLKEREGISTERET"
    | "INGEN_STATUS_FOLKEREGISTERET"
export type KanStarteOppfolging =
    | "JA"
    | "JA_MED_MANUELL_GODKJENNING_PGA_IKKE_BOSATT" // Manuell dokumentering/godkjenning på at bruker har lovlig opphold
    | "JA_MED_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS_GBR" // Skal fjernes
    | "JA_MED_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS" // Manuell dokumentering/godkjenning på at bruker har lovlig opphold
    | "ALLEREDE_UNDER_OPPFOLGING"
    | "ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT" // Disse kan reaktiveres (foreløpig)
    | "ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT_MEN_KREVER_MANUELL_GODKJENNING_PGA_IKKE_BOSATT"
    | "ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT_MEN_KREVER_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS_GBR"
    | KanIkkeStarteOppfolgingPgaIkkeTilgang
    | KanIkkeStartePgaFolkeregisterStatus

interface GraphqlSuccessResponse {
    data: {
        oppfolging: {
            kanStarteOppfolging: KanStarteOppfolging
        }
        oppfolgingsEnhet: {
            enhet?: Enhet
        }
    }
}

interface GraphqlErrorResponse {
    ok: false
    type: "GraphqlError"
    error: Error
}

type GraphqlResponse =
    | { errors: { message: string }[] }
    | GraphqlSuccessResponse

const getOppfolgingStatus = async (fnr: string, token: string) => {
    const response = await resilientFetch<GraphqlResponse>(graphqlUrl, {
        body: JSON.stringify(graphqlBody(fnr)),
        headers: {
            Accept: "application/json",
            ["Nav-Consumer-Id"]: "inngar",
            Authorization: `Bearer ${token}`,
            ["Content-Type"]: "application/json",
        },
        method: "POST",
    })
    if (response.ok) {
        if ("errors" in response.data) {
            const errorMessage = response.data.errors
                ?.map((it) => it.message)
                .join(",")
            return {
                ok: false as const,
                type: "GraphqlError" as const,
                error: new Error(`GraphqlError: ${errorMessage}`),
            } as GraphqlErrorResponse
        }
    }
    return response as Success<GraphqlSuccessResponse> | HttpError | FetchError
}

export const VeilarboppfolgingApi = {
    startOppfolging,
    getOppfolgingStatus,
    reaktiverOppfolging,
}
