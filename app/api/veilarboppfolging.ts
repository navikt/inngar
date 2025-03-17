import { type App, apps } from "~/util/appConstants"
import { logger } from "../../server/logger"
import {
    type FetchError,
    type HttpError,
    resilientFetch,
    type Success,
} from "~/util/resilientFetch"

const toUrl = (targetApp: App, pathname: string): string => {
    return `http://${targetApp.name}.${targetApp.namespace}${pathname}`
}

const startOppfolgingUrl = toUrl(
    apps.veilarboppfolging,
    "/veilarboppfolging/api/v3/oppfolging/startOppfolgingsperiode",
)
const graphqlUrl = toUrl(
    apps.veilarboppfolging,
    "/veilarboppfolging/api/graphql",
)

export type ArenaReponseKoder =
    | "OK_REGISTRERT_I_ARENA"
    | "FNR_FINNES_IKKE"
    | "KAN_REAKTIVERES_FORENKLET"
    | "BRUKER_ALLEREDE_ARBS"
    | "BRUKER_ALLEREDE_IARBS"
    | "UKJENT_FEIL"

interface StartOppfolgingSuccessPayload {
    kode: ArenaReponseKoder
}

interface StartOppfolgingErrorResponse {
    ok: false
    error: string
}

interface StartOppfolgingSuccessResponse {
    ok: true
    body: StartOppfolgingSuccessPayload
}

const startOppfolging = async (
    fnr: string,
    token: string,
): Promise<StartOppfolgingSuccessResponse | StartOppfolgingErrorResponse> => {
    return resilientFetch<StartOppfolgingSuccessPayload>(startOppfolgingUrl, {
        headers: {
            ["Nav-Consumer-Id"]: "inngar",
            Authorization: `Bearer ${token}`,
            ["Content-Type"]: "application/json",
        },
        body: JSON.stringify({ fnr, henviserSystem: "DEMO" }),
        method: "POST",
    }).then((response) => {
        if (response.ok) {
            return {
                ok: true,
                body: response.data,
            } as StartOppfolgingSuccessResponse
        } else if (response.type === "HttpError") {
            logger.error(
                `Start oppfølging feilet http-status: ${response.status} - melding ${response.errorBody}`,
            )
            return {
                ok: false,
                error: response.error.toString(),
            } as StartOppfolgingErrorResponse
        } else {
            logger.error(
                `Start oppfølging feilet (http kall feilet): ${response.error.message}`,
            )
            return {
                ok: false,
                error: "Start oppfølging feilet",
            } as StartOppfolgingErrorResponse
        }
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
    | "ALLEREDE_UNDER_OPPFOLGING"
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
}
