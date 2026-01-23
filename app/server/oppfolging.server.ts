import { VeilarboppfolgingApi } from "~/api/veilarboppfolging.ts"
import { getOboToken } from "~/util/tokenExchange.server.ts"
import { apps } from "~/util/appConstants.ts"
import { logger } from "../../server/logger.ts"
import { dataWithTraceId } from "~/util/errorUtil.ts"
import type { Route } from "../../.react-router/types/app/routes/+types"

export const startOppfolging = async (args: Route.ActionArgs, fnr: string) => {
    try {
        logger.info("Starter oppfølging")
        const tokenOrResponse = await getOboToken(
            args.request,
            apps.veilarboppfolging,
        )
        if (tokenOrResponse.ok) {
            const startOppfolgingResponse =
                await VeilarboppfolgingApi.startOppfolging(
                    fnr,
                    tokenOrResponse.token,
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
            `Kunne ikke opprette oppfolgingsperiode i veilarboppfolging ${e.toString()}`,
        )
        throw dataWithTraceId(
            {
                message: `Kunne ikke opprette oppfolgingsperiode i veilarboppfolging: ${(e as Error).cause}`,
            },
            { status: 500 },
        )
    }
}
