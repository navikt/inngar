import type { Route } from "./+types/index"
import {
    Alert,
    BodyShort,
    Button,
    ErrorSummary,
    Heading,
    List,
    TextField,
} from "@navikt/ds-react"
import { useFetcher } from "react-router"
import { getOboToken } from "~/util/tokenExchange.server"
import { DefaultErrorBoundary } from "~/components/DefaultErrorBoundary"
import { apps, toAppUrl } from "~/util/appConstants"
import { VeilarboppfolgingApi } from "~/api/veilarboppfolging"
import { logger } from "../../server/logger"
import { dataWithTraceId } from "~/util/errorUtil"
import { isUnder18 } from "~/util/erUnder18Helper"
import RegistreringUnder18 from "~/components/RegistreringUnder18"
import { useState } from "react"
import { resilientFetch } from "~/util/resilientFetch"

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
                status: oppfolging.erUnderOppfolging
                    ? (BrukerStatus.ALLEREDE_UNDER_OPPFOLGING as const)
                    : (BrukerStatus.IKKE_UNDER_OPPFOLGING as const),
                enhet,
                fnr: aktivBruker,
                erUnderOppfolging: oppfolging.erUnderOppfolging,
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
            <Alert variant={"info"}>
                <Heading size={"medium"}>
                    Innbyggeren blir ikke registrert som arbeidssøker
                </Heading>
                <BodyShort>
                    Når du registrerer en innbygger for arbeidsrettet oppfølging
                    her, blir ikke innbyggeren registrert som arbeidssøker.
                    Dersom innbyggeren også er arbeidssøker bør du benytte
                    arbeidssøkerregistreringen.
                </BodyShort>
            </Alert>
            <fetcher.Form method="post" className="space-y-4">
                {error ? <FormError message={error} /> : null}
                <input type="hidden" name="fnr" value={fnr} />
                <Button
                    disabled={
                        !enhet || (brukerErUnder18 && !erSamtykkeBekreftet)
                    }
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
        return <Alert variant="warning">Fant ikke enhet</Alert>
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

export const ErrorBoundary = DefaultErrorBoundary
