import type { Route } from "../../.react-router/types/app/routes/+types"
import { logger } from "../../server/logger.ts"
import { getOboToken } from "~/util/tokenExchange.server.ts"
import { apps } from "~/util/appConstants.ts"
import { VeilarboppfolgingApi } from "~/api/veilarboppfolging.ts"
import { dataWithTraceId } from "~/util/errorUtil.ts"

export const reaktiverOppfolging = async (
    args: Route.ActionArgs,
    fnr: string,
) => {
    try {
        logger.info("Reaktiver oppfølging")
        const tokenOrResponse = await getOboToken(
            args.request,
            apps.veilarboppfolging,
        )
        if (tokenOrResponse.ok) {
            const reaktiverOppfolgingResponse =
                await VeilarboppfolgingApi.reaktiverOppfolging(
                    fnr,
                    tokenOrResponse.token,
                )
            if (reaktiverOppfolgingResponse.ok) {
                return new Response(null, {
                    status: 302,
                    headers: {
                        Location: `/registrert?result=${reaktiverOppfolgingResponse.body.kode}`,
                    },
                })
            } else {
                return { error: reaktiverOppfolgingResponse.error }
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
