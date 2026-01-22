import { resilientFetch } from "~/util/resilientFetch"
import { aktivEnhetUrl } from "~/config"
import { getOboToken } from "~/util/tokenExchange.server"
import { apps } from "~/util/appConstants"
import { logger } from "../../server/logger"
import { dataWithTraceId } from "~/util/errorUtil"
import {
    type KanStarteOppfolging,
    VeilarboppfolgingApi,
} from "~/api/veilarboppfolging"
import { ModiacontextholderApi } from "~/api/modiacontextholder"
import { BrukerStatus, finnBrukerStatus } from "~/registreringPage/BrukerStatus"
import { redirect } from "react-router"
import type { NavKontor } from "~/registreringPage/StartOppfolgingForm.tsx"
import { AoOppfolgingskontorApi } from "~/api/aoOppfolgingskontor.ts"
import { EnvType, getEnv } from "~/util/envUtil.ts"

export interface UserLoaderSuccessResponse {
    status: BrukerStatus
    navKontor: NavKontor
    aktivtNavKontor: string
    fnr: string
    kanStarteOppfolging: KanStarteOppfolging
}

export const userLoader = async (request: Request, fnrCode: string) => {
    const brukAoOppfolgingskontor = getEnv().type !== EnvType.prod
    const hentAktivEnhet = () =>
        resilientFetch<{ aktivEnhet: string | null }>(
            new Request(aktivEnhetUrl, new Request(request)),
        )
    const hentAktivBruker = () =>
        ModiacontextholderApi.getFnrFromCode(fnrCode).then((result) => {
            if (result.ok) {
                /* Set user in context, but don't need to wait for it to resolve */
                ModiacontextholderApi.setFnrIContextHolder(
                    result.data.fnr,
                    request,
                )
                return result
            } else if (
                result.error &&
                result.type === "HttpError" &&
                result.status === 404
            ) {
                return { ok: true, data: { fnr: null, code: fnrCode } } as const
            }
            return result
        })

    /* Ikke ta denne inn i VeilarboppfolgingApi, da kan den ikke paralelliseres */
    const hentOboForVeilarboppfolging = () =>
        getOboToken(request, apps.veilarboppfolging)

    const hentOboForAoOppfolgingskontor = () =>
        getOboToken(request, apps.aoOppfolgingskontor)

    const [veilarbOppfolgingTokenOrResponse, aoOppfolgingskontorTokenOrResponse, aktivBrukerResult, aktivEnhetResult] =
        await Promise.all([
            hentOboForVeilarboppfolging(),
            hentOboForAoOppfolgingskontor(),
            hentAktivBruker(),
            hentAktivEnhet(),
        ])

    if (!aktivBrukerResult.ok) {
        logger.warn(
            `henting av bruker fra fnrCode feilet, ${aktivBrukerResult.type}, ${aktivBrukerResult.error.message}`,
        )
        return redirect("/")
    }

    if (!veilarbOppfolgingTokenOrResponse.ok)
        throw dataWithTraceId({
            errorMessage:
                "Kunne ikke hente aktivbruker (On-Behalf-Of exchange feilet)",
        })

    if (!aoOppfolgingskontorTokenOrResponse.ok)
        throw dataWithTraceId({
            errorMessage:
                "Kunne ikke hente arbeidsoppfølgingskontor (On-Behalf-Of exchange feilet)",
        })

    const aktivBruker = aktivBrukerResult.data.fnr
    if (!aktivBruker) {
        return redirect("/")
    } else {
        const oppfolgingsStatus =
            await VeilarboppfolgingApi.getOppfolgingStatus(
                aktivBruker,
                veilarbOppfolgingTokenOrResponse.token,
            )
        if (!oppfolgingsStatus.ok) {
            throw oppfolgingsStatus.error
        }
        const { oppfolging, oppfolgingsEnhet } = oppfolgingsStatus.data.data

        const hentNavKontor = async () => {
            if (brukAoOppfolgingskontor) {
                const arbeidsoppfolgingskontorResponse
                    = await AoOppfolgingskontorApi.finnArbeidsoppfolgingskontor(aktivBruker, aoOppfolgingskontorTokenOrResponse.token)
                if (!arbeidsoppfolgingskontorResponse.ok) {
                    throw arbeidsoppfolgingskontorResponse.error
                }
                return {
                    navn: arbeidsoppfolgingskontorResponse.data.kontorNavn,
                    id: arbeidsoppfolgingskontorResponse.data.kontorId,
                }
            } else {
                return oppfolgingsEnhet.enhet
            }
        }
        const navKontor = await hentNavKontor()

        const aktivEnhet = aktivEnhetResult.ok
            ? aktivEnhetResult.data.aktivEnhet
            : null
        return {
            status: finnBrukerStatus(oppfolging.kanStarteOppfolging),
            navKontor,
            aktivtNavKontor: aktivEnhet,
            fnr: aktivBruker,
            kanStarteOppfolging: oppfolging.kanStarteOppfolging,
        }
    }
}
