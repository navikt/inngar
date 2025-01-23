import type { Route } from "./+types/index"
import {
    Alert,
    BodyShort,
    Button,
    ErrorSummary,
    Heading,
} from "@navikt/ds-react"
import { data, useFetcher, useLoaderData } from "react-router"
import { logger } from "~/logger"
import { useFnrState } from "~/root"
import { getOboToken } from "~/util/tokenExchange.server"
import { DefaultErrorBoundary } from "~/components/DefaultErrorBoundary"
import { type App, apps, toAppUrl } from "~/util/appConstants"
import { VeilarboppfolgingApi } from "~/api/veilarboppfolging"

export async function clientLoader({}) {
    if (import.meta.env.DEV) {
        import("../mock/setupMockClient.client")
    }
}

const aktivBrukerUrl = toAppUrl(
    apps.modiacontextholder,
    "/api/context/v2/aktivbruker",
)

export async function loader(loaderArgs: Route.LoaderArgs) {
    // if (!tokenOrResponse.ok) return tokenOrResponse
    // const res = fetch(aktivBrukerUrl, {
    //     headers: headersWithAuth(tokenOrResponse.token),
    // })
    try {
        const hentAktivBruker = () =>
            fetch(new Request(aktivBrukerUrl, new Request(loaderArgs.request)))
        const hentOboForVeilarboppfolging = () =>
            getOboToken(loaderArgs.request, apps.veilarboppfolging)

        const [tokenOrResponse, aktivBrukerResult] = await Promise.all([
            hentOboForVeilarboppfolging(),
            hentAktivBruker(),
        ])
        const aktivBruker = (await aktivBrukerResult.json()) as {
            aktivBruker: null | string
        }

        if (!tokenOrResponse.ok)
            throw data({
                errorMessage:
                    "Kunne ikke hente aktivbruker (On-Behalf-Of exchange feilet)",
            })

        if (aktivBruker.aktivBruker === null) {
            return { erUnderOppfolging: "VET_IKKE" }
        } else {
            const oppfolgingsStatus =
                await VeilarboppfolgingApi.getOppfolgingStatus(
                    aktivBruker.aktivBruker,
                    tokenOrResponse.token,
                )
            console.log(`oppfolgingsstatus inne: ${oppfolgingsStatus}`)
            console.log(`oppfolgingsstatus ute: `, oppfolgingsStatus)
            return {
                erUnderOppfolging:
                    oppfolgingsStatus.data.oppfolging.erUnderOppfolging,
            }
        }
    } catch (e: Error) {
        logger.error(
            `index loader catch error:${e.name} message: ${e.message}  stack: ${e.stack}`,
        )
    }
}

export function meta({}: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
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

const toUrl = (targetApp: App, pathname: string): string => {
    return `http://${targetApp.name}.${targetApp.namespace}${pathname}`
}

const startOppfolgingUrl = toUrl(
    apps.veilarboppfolging,
    "/veilarboppfolging/api/v3/oppfolging/startOppfolgingsperiode",
)

export const action = async (args: Route.ActionArgs) => {
    const formdata = await args.request.formData()
    const fnr = formdata.get("fnr")

    if (!fnr || typeof fnr !== "string") {
        return { error: `Fødselsnummer er påkrevd` }
    }

    try {
        logger.info("Starter oppfølging")
        const tokenOrResponse = await getOboToken(
            args.request,
            apps.veilarboppfolging,
        )
        if (tokenOrResponse.ok) {
            return VeilarboppfolgingApi.startOppfolging(
                fnr,
                tokenOrResponse.token,
            )
        } else {
            return tokenOrResponse
        }
    } catch (e) {
        logger.error(
            `Kunne ikke opprette oppfolgingsperiode i veilarboppfolging ${e.toString()}`,
        )
        throw data(
            {
                message:
                    "Kunne ikke opprette oppfolgingsperiode i veilarboppfolging",
            },
            { status: 500 },
        )
    }
}

export function HydrateFallback() {
    return <p>Loading...</p>
}

export default function Index() {
    const loaderData = useLoaderData<Awaited<ReturnType<typeof loader>>>()
    const fnrState = useFnrState()
    const fetcher = useFetcher()
    const error = fetcher.data?.error
    const erIkkeUnderOppfolging = loaderData?.erUnderOppfolging === false
    return (
        <div>
            <div className="flex flex-col w-[620px] m-8 p-4 space-y-4 mx-auto">
                <Heading size="large">
                    Registrering for arbeidsrettet oppfølging
                </Heading>

                <p>{loaderData?.erUnderOppfolging}</p>

                {
                    erIkkeUnderOppfolging ? <>
                        <BodyShort>
                            Før du kan gjøre en § 14 a vurdering må du registrere
                            innbyggeren for arbeidsrettet oppfølging.
                        </BodyShort>
                        <BodyShort>
                            Innbyggeren får tilgang til aktivitetsplan og arbeidsrettet
                            dialog så snart oppfølgingen er startet.
                        </BodyShort>
                        <BodyShort>
                            Innbyggeren får tilgang til aktivitetsplan og arbeidsrettet
                            dialog så snart oppfølgingen er startet.
                        </BodyShort>
                        <Alert variant={"info"}>
                            <Heading size={"medium"}>
                                Innbyggeren blir ikke registrert som arbeidssøker
                            </Heading>
                            <BodyShort>
                                Når du registrerer en innbygger for arbeidsrettet
                                oppfølging her, blir ikke innbyggeren registrert som
                                arbeidssøker. Dersom innbyggeren også er arbeidssøker
                                bør du benytte arbeidssøkerregistreringen.
                            </BodyShort>
                        </Alert>
                        <fetcher.Form method="post" className="space-y-4">
                            {error ? <FormError message={error} /> : null}
                            <input
                              type="hidden"
                              name="fnr"
                              value={!fnrState.loading ? fnrState.fnr || "" : ""}
                            />
                            <Button loading={fetcher.state == "submitting"}>
                                Start arbeidsoppfølging
                            </Button>
                        </fetcher.Form></> : (loaderData?.erUnderOppfolging === true
                            ? <Alert variant="info">Bruker er allerede under arbeidsoppfølging</Alert>
                            : <Alert variant="info">Feilet ved henting av oppfølgingsstatus på bruker</Alert>
                        )
                }
            </div>
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

export const ErrorBoundary = DefaultErrorBoundary
