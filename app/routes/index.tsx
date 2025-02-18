import type { Route } from "./+types/index"
import { Alert, Heading } from "@navikt/ds-react"
import { getOboToken } from "~/util/tokenExchange.server"
import { DefaultErrorBoundary } from "~/components/DefaultErrorBoundary"
import { apps, toAppUrl } from "~/util/appConstants"
import {
    type KanIkkeStarteOppfolgingPgaIkkeTilgang,
    type KanIkkeStartePgaFolkeregisterStatus,
    type KanStarteOppfolging,
    VeilarboppfolgingApi,
} from "~/api/veilarboppfolging"
import { logger } from "../../server/logger"
import { dataWithTraceId } from "~/util/errorUtil"
import { resilientFetch } from "~/util/resilientFetch"
import { IkkeTilgangWarning } from "~/registreringPage/IkkeTilgangWarning"
import { StartOppfolgingForm } from "~/registreringPage/StartOppfolgingForm"
import { UgyldigFregStatusWarning } from "~/registreringPage/UgyldigFregStatusWarning"

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
    if (import.meta.env.DEV) {
        import("../mock/setupMockClient.client")
    }
    const serverData = await serverLoader()
    return {
        ...serverData,
    }
}

const aktivBrukerUrl = toAppUrl(
    apps.modiacontextholder,
    "/api/context/v2/aktivbruker",
)

enum BrukerStatus {
    INGEN_BRUKER_VALGT = "INGEN_BRUKER_VALGT",
    IKKE_UNDER_OPPFOLGING = "IKKE_UNDER_OPPFOLGING",
    ALLEREDE_UNDER_OPPFOLGING = "ALLEREDE_UNDER_OPPFOLGING",
    IKKE_TILGANG = "IKKE_TILGANG",
    UGYLDIG_BRUKER_FREG_STATUS = "UGYLDIG_BRUKER_FREG_STATUS",
}

const finnBrukerStatus = (kanStarteOppfolging: KanStarteOppfolging) => {
    switch (kanStarteOppfolging) {
        case "JA":
            return BrukerStatus.IKKE_UNDER_OPPFOLGING
        case "ALLEREDE_UNDER_OPPFOLGING":
            return BrukerStatus.ALLEREDE_UNDER_OPPFOLGING
        case "DOD":
        case "UKJENT_STATUS_FOLKEREGISTERET":
        case "IKKE_LOVLIG_OPPHOLD":
            return BrukerStatus.UGYLDIG_BRUKER_FREG_STATUS
        default:
            return BrukerStatus.IKKE_TILGANG
    }
}

export async function loader(loaderArgs: Route.LoaderArgs) {
    console.log("LOADER Index.tsx")
    try {
        const hentAktivBruker = () =>
            resilientFetch<{ aktivBruker: string | null }>(
                new Request(aktivBrukerUrl, new Request(loaderArgs.request)),
            )
        const hentOboForVeilarboppfolging = () =>
            getOboToken(loaderArgs.request, apps.veilarboppfolging)

        const [tokenOrResponse, aktivBrukerResult] = await Promise.all([
            hentOboForVeilarboppfolging(),
            hentAktivBruker(),
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

        if (!aktivBrukerResult.data.aktivBruker) {
            return { status: BrukerStatus.INGEN_BRUKER_VALGT as const } as const
        } else {
            const aktivBruker = aktivBrukerResult.data.aktivBruker
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
            return {
                status: finnBrukerStatus(oppfolging.kanStarteOppfolging),
                enhet,
                fnr: aktivBruker,
                kanStarteOppfolging: oppfolging.kanStarteOppfolging,
            }
        }
    } catch (e) {
        throw dataWithTraceId(
            { errorMessage: e.message, stack: e.stack },
            { status: 500 },
        )
    }
}

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Modia" },
        { name: "inngar", content: "Start arbeidsoppfølging" },
    ]
}

export function handleError(
    error: unknown,
    { request }: Route.ActionArgs | Route.LoaderArgs,
) {
    if (!request.signal.aborted) {
        logger.error(error)
    }
}

export const action = async (args: Route.ActionArgs) => {
    const formdata = await args.request.formData()
    const fnr = formdata.get("fnr")

    if (!fnr || typeof fnr !== "string") {
        return {
            error: `Fødselsnummer er påkrevd men var:${fnr === null ? "null" : fnr}`,
        }
    }

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

export function HydrateFallback() {
    return <p>Loading...</p>
}

export default function Index({
    loaderData,
}: {
    loaderData: Awaited<ReturnType<typeof loader>>
}) {
    return (
        <div className="flex flex-col w-[620px] p-4 mx-auto space-y-4">
            <Heading size="large">Start arbeidsrettet oppfølging</Heading>
            <IndexPage {...loaderData} />
        </div>
    )
}

const IndexPage = (props: Awaited<ReturnType<typeof loader>>) => {
    switch (props.status) {
        case BrukerStatus.INGEN_BRUKER_VALGT:
            return <Alert variant="info">Ingen bruker valgt</Alert>
        case BrukerStatus.ALLEREDE_UNDER_OPPFOLGING:
            return (
                <Alert variant="info">
                    Bruker er allerede under arbeidsoppfølging
                </Alert>
            )
        case BrukerStatus.IKKE_UNDER_OPPFOLGING:
            return <StartOppfolgingForm fnr={props.fnr} enhet={props.enhet} />
        case BrukerStatus.UGYLDIG_BRUKER_FREG_STATUS:
            return (
                <UgyldigFregStatusWarning
                    kanStarteOppfolging={
                        props.kanStarteOppfolging as KanIkkeStartePgaFolkeregisterStatus
                    }
                />
            )
        case BrukerStatus.IKKE_TILGANG:
            return (
                <IkkeTilgangWarning
                    kanStarteOppfolging={
                        props.kanStarteOppfolging as KanIkkeStarteOppfolgingPgaIkkeTilgang
                    }
                />
            )
    }
}

export const ErrorBoundary = DefaultErrorBoundary
