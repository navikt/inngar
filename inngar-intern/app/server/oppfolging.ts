import { logger } from "../../server/logger.ts"
import { getOboToken } from "~/util/tokenExchange.server.ts"
import { apps } from "~/util/appConstants.ts"
import { VeilarboppfolgingApi } from "~/api/veilarboppfolging.ts"
import { dataWithTraceId } from "~/util/errorUtil.ts"

export const startOppfolging = async (
    request: Request,
    fnr: string,
    kontorSattAvVeileder?: string,
) => {
    try {
        logger.info("Starter oppfølging")
        const tokenOrResponse = await getOboToken(
            request,
            apps.veilarboppfolging,
        )
        if (tokenOrResponse.ok) {
            const startOppfolgingResponse =
                await VeilarboppfolgingApi.startOppfolging(
                    fnr,
                    tokenOrResponse.token,
                    kontorSattAvVeileder,
                )
            if (startOppfolgingResponse.ok) {
                return new Response(null, {
                    status: 302,
                    headers: {
                        Location: `/registrert?result=${startOppfolgingResponse.body.kode}`,
                    },
                })
            } else {
                return { error: startOppfolgingResponse.error }
            }
        } else {
            return tokenOrResponse
        }
    } catch (e) {
        logger.error(
            `Kunne ikke opprette oppfolgingsperiode i veilarboppfolging ${e?.toString()}`,
        )
        throw dataWithTraceId(
            {
                message: `Kunne ikke opprette oppfolgingsperiode i veilarboppfolging: ${(e as Error).cause}`,
            },
            { status: 500 },
        )
    }
}
