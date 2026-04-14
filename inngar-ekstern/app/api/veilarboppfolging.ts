import type { StartOppfolgingErrorResponse, StartOppfolgingSuccess } from "common"
import { apps, logger, toUrl } from "common"

const graphqlUrl = toUrl(
    apps.veilarboppfolging,
    "/veilarboppfolging/api/graphql",
)

const oppfolgingQuery = `
  query {
    oppfolging {
        kanStarteOppfolgingEkstern
    }
  }
`

export type KanStarteOppfolgingEkstern =
    | "JA"
    | "JA_MED_MANUELL_GODKJENNING_PGA_IKKE_BOSATT"
    | "JA_MED_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS_GBR"
    | "ALLEREDE_UNDER_OPPFOLGING"
    | "ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT"
    | "ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT_MEN_KREVER_MANUELL_GODKJENNING_PGA_IKKE_BOSATT"
    | "ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT_MEN_KREVER_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS_GBR"
    | "DOD"
    | "IKKE_LOVLIG_OPPHOLD"
    | "UKJENT_STATUS_FOLKEREGISTERET"
    | "INGEN_STATUS_FOLKEREGISTERET"

interface OppfolgingGraphqlSuccessResponse {
    data: {
        oppfolging: {
            kanStarteOppfolgingEkstern: KanStarteOppfolgingEkstern
        }
    }
}

interface OppfolgingGraphqlErrorResponse {
    ok: false
    error: Error
}

export const getKanStarteOppfolgingEkstern = async (
    token: string,
): Promise<OppfolgingGraphqlSuccessResponse | OppfolgingGraphqlErrorResponse> => {
    return fetch(graphqlUrl, {
        method: "POST",
        headers: {
            Accept: "application/json",
            ["Nav-Consumer-Id"]: "inngar",
            Authorization: `Bearer ${token}`,
            ["Content-Type"]: "application/json",
        },
        body: JSON.stringify({ query: oppfolgingQuery, variables: { fnr: undefined, } }),
    })
        .then(async (response) => {
            if (!response.ok) {
                const body = await response.text()
                logger.error(
                    `Henting av oppfølgingsstatus feilet med http-status: ${response.status}, melding: ${body}`,
                )
                return {
                    ok: false as const,
                    error: new Error(
                        `Henting av oppfølgingsstatus feilet: ${response.status}`,
                    ),
                } as OppfolgingGraphqlErrorResponse
            }
            const json = await response.json()
            if ("errors" in json) {
                const errorMessage = json.errors
                    ?.map((it: { message: string }) => it.message)
                    .join(",")
                logger.error(`GraphQL-feil ved henting av oppfølgingsstatus: ${errorMessage}`)
                return {
                    ok: false as const,
                    error: new Error(`GraphQL-feil: ${errorMessage}`),
                } as OppfolgingGraphqlErrorResponse
            }
            return json as OppfolgingGraphqlSuccessResponse
        })
        .catch((e: Error) => {
            logger.error(
                `Henting av oppfølgingsstatus feilet (http kall feilet): ${e.toString()}`,
            )
            return {
                ok: false as const,
                error: e,
            } as OppfolgingGraphqlErrorResponse
        })
}

const startOppfolgingUrl = toUrl(
    apps.veilarboppfolging,
    "/veilarboppfolging/api/v3/oppfolging/startOppfolgingsperiode",
)

export const startOppfolging = async (
    token: string,
): Promise<StartOppfolgingSuccess | StartOppfolgingErrorResponse> => {
    const body = { henviserSystem: "INNGAR_EKSTERN" }
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
