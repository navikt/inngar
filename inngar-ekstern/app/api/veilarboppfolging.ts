import type { StartOppfolgingErrorResponse, StartOppfolgingSuccess } from "common"
import { toUrl, apps } from "common"

const startOppfolgingUrl = toUrl(
    apps.veilarboppfolging,
    "/veilarboppfolging/api/v3/oppfolging/startOppfolgingsperiode",
)

export const startOppfolging = async (
    token: string,
): Promise<StartOppfolgingSuccess | StartOppfolgingErrorResponse> => {
    const body = { henviserSystem: "INNGAR_EKSTERN", }
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