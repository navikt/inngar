import { resilientFetch, type Success } from "~/util/resilientFetch"
import { aktivBrukerUrl, aktivEnhetUrl } from "~/config"
import { getOboToken } from "~/util/tokenExchange.server"
import { apps } from "~/util/appConstants"
import { logger } from "../../server/logger"
import { dataWithTraceId } from "~/util/errorUtil"
import { VeilarboppfolgingApi } from "~/api/veilarboppfolging"
import { ModiacontextholderApi } from "~/api/modiacontextholder"
import { finnBrukerStatus } from "~/registreringPage/BrukerStatus"
import { redirect } from "react-router"

const getAktivBruker = (
    successResult:
        | Success<{ aktivBruker: string | null }>
        | Success<{ fnr: string }>,
) => {
    if ("aktivBruker" in successResult.data) {
        return successResult.data.aktivBruker
    } else {
        return successResult.data.fnr
    }
}

export const userLoader = async (request: Request, fnrCode: string | null) => {
    const hentAktivEnhet = () =>
        resilientFetch<{ aktivEnhet: string | null }>(
            new Request(aktivEnhetUrl, new Request(request)),
        )
    const hentAktivBruker =
        fnrCode == null
            ? () =>
                  resilientFetch<{ aktivBruker: string | null }>(
                      new Request(aktivBrukerUrl, new Request(request)),
                  )
            : () => ModiacontextholderApi.getFnrFromCode(fnrCode)

    /* Ikke ta denne inn i VeilarboppfolgingApi, da kan den ikke paralelliseres */
    const hentOboForVeilarboppfolging = () =>
        getOboToken(request, apps.veilarboppfolging)

    const [tokenOrResponse, aktivBrukerResult, aktivEnhetResult] =
        await Promise.all([
            hentOboForVeilarboppfolging(),
            hentAktivBruker(),
            hentAktivEnhet(),
        ])

    if (!aktivBrukerResult.ok) {
        logger.warn(aktivBrukerResult.error.message)
        logger.warn(aktivBrukerResult.type)
        throw aktivBrukerResult.error
    }
    if (!tokenOrResponse.ok)
        throw dataWithTraceId({
            errorMessage:
                "Kunne ikke hente aktivbruker (On-Behalf-Of exchange feilet)",
        })

    const aktivBruker = getAktivBruker(aktivBrukerResult)
    if (!aktivBruker) {
        return redirect("/")
        // return { status: BrukerStatus.INGEN_BRUKER_VALGT as const } as const
    } else {
        const oppfolgingsStatus =
            await VeilarboppfolgingApi.getOppfolgingStatus(
                aktivBruker,
                tokenOrResponse.token,
            )
        if (!oppfolgingsStatus.ok) {
            throw oppfolgingsStatus.error
        }
        const { oppfolging, oppfolgingsEnhet } = oppfolgingsStatus.data.data
        const enhet = oppfolgingsEnhet.enhet ?? null
        const aktivEnhet = aktivEnhetResult.ok
            ? aktivEnhetResult.data.aktivEnhet
            : null
        return {
            status: finnBrukerStatus(oppfolging.kanStarteOppfolging),
            navKontor: enhet,
            aktivtNavKontor: aktivEnhet,
            fnr: aktivBruker,
            kanStarteOppfolging: oppfolging.kanStarteOppfolging,
        }
    }
}
