import { logger } from "~/logger"
import { type App, apps } from "~/util/appConstants"

const toUrl = (targetApp: App, pathname: string): string => {
    return `http://${targetApp.name}.${targetApp.namespace}${pathname}`
}

const startOppfolgingUrl = toUrl(
    apps.veilarboppfolging,
    "/veilarboppfolging/api/v3/oppfolging/startOppfolgingsperiode",
)
const graphqlUrl = toUrl(apps.veilarboppfolging, "/veilarboppfolging/api/graphql")

const startOppfolging = async (fnr: string, token: string) => {
    let response = await fetch(startOppfolgingUrl, {
        headers: {
            ["Nav-Consumer-Id"]: "inngar",
            Authorization: `Bearer ${token}`,
            ["Content-Type"]: "application/json",
        },
        body: JSON.stringify({ fnr, henviserSystem: "DEMO" }),
        method: "POST",
    }).then(async (proxyResponse) => {
        if (!proxyResponse.ok) {
            logger.error(
                `Dårlig respons ${proxyResponse.status}`,
                await proxyResponse.text(),
            )
        }
        return proxyResponse
    })
    if (!response.ok) {
        logger.error(`Start oppfølging feilet: ${response.status}`)
        return { ok: false as const, error: await response.text() }
    }
    logger.info("Oppfølging startet")
    return { ok: true as const }
}

const query = `
  query($fnr: String!) {
    oppfolgingsEnhet(fnr: $fnr) {
        enhet {
            navn,
            id
        },
        kilde
    }
    oppfolging(fnr: $fnr) {
        erUnderOppfolging 
    }
  }
`

const graphqlBody = (fnr: string) => ({
    query,
    variables: {
        fnr,
    },
})

interface Enhet  {
    id: string,
    navn: string,
    kilde: string,
}

interface GraphqlResponse {
    errors?: any[],
    data: {
        oppfolging: {
            erUnderOppfolging: boolean
        },
        oppfolgingsEnhet: {
            enhet?: Enhet
        }
    }
}

const getOppfolgingStatus = (
    fnr: string,
    token: string,
): Promise<GraphqlResponse> => {
    return fetch(graphqlUrl, {
        body: JSON.stringify(graphqlBody(fnr)),
        headers: {
            ["Nav-Consumer-Id"]: "inngar",
            Authorization: `Bearer ${token}`,
            ["Content-Type"]: "application/json",
        },
        method: "POST",
    }).then((response) => {
        if (!response.ok)
            throw Error(
                `Feilet å hente oppfolgingsstatus fra veilarboppfølging ${response.status}`,
            )
        return response.json()
    })
}

export const VeilarboppfolgingApi = {
    startOppfolging,
    getOppfolgingStatus,
}
