import type { Route } from "./+types/index"
import {
    Alert,
    BodyShort,
    Button,
    ErrorSummary,
    Heading,
    Link,
    List,
    TextField,
} from "@navikt/ds-react"
import { useFetcher } from "react-router"
import { getOboToken } from "~/util/tokenExchange.server"
import { DefaultErrorBoundary } from "~/components/DefaultErrorBoundary"
import { apps, toAppUrl } from "~/util/appConstants"
import {
    type KanIkkeStarteOppfolgingPgaIkkeTilgang,
    type KanStarteOppfolging,
    VeilarboppfolgingApi,
} from "~/api/veilarboppfolging"
import { logger } from "../../server/logger"
import { dataWithTraceId } from "~/util/errorUtil"
import { isUnder18 } from "~/util/erUnder18Helper"
import RegistreringUnder18 from "~/components/RegistreringUnder18"
import { useState } from "react"
import { resilientFetch } from "~/util/resilientFetch"

const arbeidssokerRegistreringUrl =
    "https://arbeidssokerregistrering-for-veileder.intern.dev.nav.no/" // import.meta.env.ARBEIDSSOKERREGISTRERING_URL

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
}

const finnBrukerStatus = (kanStarteOppfolging: KanStarteOppfolging) => {
    switch (kanStarteOppfolging) {
        case "JA":
            return BrukerStatus.IKKE_UNDER_OPPFOLGING
        case "ALLEREDE_UNDER_OPPFOLGING":
            return BrukerStatus.ALLEREDE_UNDER_OPPFOLGING
        default:
            return BrukerStatus.IKKE_TILGANG
    }
}

interface Enhet {
    navn: string
    id: string
    kilde: string
}

export async function loader(loaderArgs: Route.LoaderArgs) {
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

        if (aktivBrukerResult.data.aktivBruker === null) {
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
            const enhet = oppfolgingsEnhet.enhet
                ? ({
                      kilde: oppfolgingsEnhet.enhet.kilde,
                      navn: oppfolgingsEnhet.enhet.navn,
                      id: oppfolgingsEnhet.enhet.id,
                  } as Enhet)
                : null
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
            } else {
                throw Error("Start oppfølging feilet", {
                    cause: startOppfolgingResponse.error,
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
            <Heading size="large">Registrer arbeidsrettet oppfølging</Heading>
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

const StartOppfolgingForm = ({
    enhet,
    fnr,
}: {
    enhet: Enhet | null | undefined
    fnr: string
}) => {
    const fetcher = useFetcher()
    const error = "error" in (fetcher?.data || {}) ? fetcher.data.error : null
    const result =
        "resultat" in (fetcher?.data || {})
            ? (fetcher.data as { kode: string; resultat: string })
            : null
    const brukerErUnder18 = isUnder18(fnr)
    const [erSamtykkeBekreftet, setErSamtykkeBekreftet] = useState(false)

    return (
        <div className="flex flex-col space-y-4 mx-auto">
            <Alert inline variant={"info"}>
                <Heading size={"medium"}>
                    Innbyggeren blir ikke registrert som arbeidssøker
                </Heading>
                <div className="space-y-4">
                    <BodyShort>
                        Dersom innbyggeren også søker arbeid bør du benytte
                        arbeidssøkerregistreringen.
                    </BodyShort>
                    <Link href={arbeidssokerRegistreringUrl}>
                        Gå til Arbeidssøkerregistrering
                    </Link>
                    <BodyShort>
                        Arbeidsrettet oppfølging utløser <b>ikke</b> meldeplikt
                        for brukeren.
                    </BodyShort>
                </div>
            </Alert>
            {brukerErUnder18 ? (
                <RegistreringUnder18 bekreftSamtykke={setErSamtykkeBekreftet} />
            ) : null}
            <EnhetsInfo enhet={enhet} />
            <List>
                <List.Item>
                    Før du kan gjøre en § 14 a vurdering må du registrere
                    innbyggeren for arbeidsrettet oppfølging.
                </List.Item>
                <List.Item>
                    Innbyggeren får tilgang til aktivitetsplan og arbeidsrettet
                    dialog så snart oppfølgingen er startet.
                </List.Item>
            </List>

            <fetcher.Form method="post" className="space-y-4">
                {error ? <FormError message={error} /> : null}
                <input type="hidden" name="fnr" value={fnr} />
                <Button
                    disabled={brukerErUnder18 && !erSamtykkeBekreftet}
                    loading={fetcher.state == "submitting"}
                >
                    Start arbeidsoppfølging
                </Button>
            </fetcher.Form>
            {result ? (
                <Alert variant="success">
                    <Heading size="small">{result.kode}</Heading>
                    <BodyShort>{result.resultat}</BodyShort>
                </Alert>
            ) : null}
        </div>
    )
}

const FormError = ({ message }: { message: string }) => {
    return (
        <ErrorSummary>
            <ErrorSummary.Item href="#searchfield-r2">
                {message}
            </ErrorSummary.Item>
        </ErrorSummary>
    )
}

const EnhetsInfo = ({ enhet }: { enhet: Enhet | null | undefined }) => {
    if (enhet === null || enhet === undefined) {
        return (
            <Alert variant="warning">
                Fant ikke enhet - brukeren har mest sannsynlig ikke registrert
                bostedsaddresse i Norge.
                <List>
                    <List.Item>
                        Hvis bruker har tidligere arbeidsgiver og kommer enhet
                        til å bli utledet av forrige arbeidsgivers addresse
                    </List.Item>
                    <List.Item>
                        Hvis ingen annen passende enhet er funnet kommer bruker
                        til å bli tilordnet enhet 2990 (IT-avdelingen)
                    </List.Item>
                </List>
            </Alert>
        )
    }

    const kilde = enhet.kilde === "ARENA" ? "Arena" : "Geografisk tilknytning"
    const beskrivelseTekst =
        enhet.kilde === "ARENA"
            ? "Bruker er registrert på følgende enhet i Arena:"
            : "Bruker blir tildelt følgende enhet etter geografisk tilknytning:"

    return (
        <>
            <TextField
                label="Oppfolgingsenhet"
                description={beskrivelseTekst}
                value={`${enhet.navn} (${enhet.id}) - ${kilde}`}
                readOnly
            />
            <BodyShort>
                Bruker kommer til å bli lagt til i porteføljen til enheten.
            </BodyShort>
        </>
    )
}

const ikkeTilgangTekst: Record<
    KanIkkeStarteOppfolgingPgaIkkeTilgang,
    { tittel: string; tekst: string }
> = {
    IKKE_TILGANG_EGNE_ANSATTE: {
        tittel: "Bruker er ansatt i NAV",
        tekst: "Du har ikke tilgang til egne ansatte",
    },
    IKKE_TILGANG_FORTROLIG_ADRESSE: {
        tittel: "Bruker har fortrolig adresse",
        tekst: "Du har ikke tilgang til brukere med fortrolig adresse",
    },
    IKKE_TILGANG_MODIA: {
        tittel: "Ikke tilgang til Modia",
        tekst: "Du har ikke tilgang til Modia",
    },
    IKKE_TILGANG_STRENGT_FORTROLIG_ADRESSE: {
        tittel: "",
        tekst: "Du har ikke tilgang til brukere med strengt fortrolig adresse",
    },
    IKKE_TILGANG_ENHET: {
        tittel: "Ikke til",
        tekst: "Du har ikke tilgang til brukerens enhet",
    },
}

const IkkeTilgangWarning = ({
    kanStarteOppfolging,
}: {
    kanStarteOppfolging: KanIkkeStarteOppfolgingPgaIkkeTilgang
}) => {
    const tekster = ikkeTilgangTekst[kanStarteOppfolging]
    return (
        <Alert variant={"error"}>
            <Heading size="small">{tekster.tittel}</Heading>
            <BodyShort>{tekster.tekst}</BodyShort>
        </Alert>
    )
}

export const ErrorBoundary = DefaultErrorBoundary
