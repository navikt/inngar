import type { Route } from "./+types/index"
import {
    Alert,
    BodyShort,
    Button,
    ErrorSummary,
    Heading,
    TextField,
} from "@navikt/ds-react"
import {
    data,
    isRouteErrorResponse,
    useFetcher,
    useLoaderData,
} from "react-router"
import { logger } from "~/logger"
import { useFnrState } from "~/root"
import { getOboToken } from "~/util/tokenExchange.server"
import { DefaultErrorBoundry } from "~/components/DefaultErrorBoundry"
import { type App, mapTilApp } from "~/util/appConstants"

export async function clientLoader({}) {
    if (import.meta.env.DEV) {
        import("../mock/setupMockClient.client")
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
    mapTilApp.veilarboppfolging,
    "/veilarboppfolging/api/v3/oppfolging/startOppfolgingsperiode",
)

export const action = async (args: Route.ActionArgs) => {
    const formdata = await args.request.formData()
    const fnr = formdata.get("fnr")

    if (!fnr) {
        return { error: `Fødselsnummer er påkrevd` }
    }
    if (typeof fnr !== "string") {
        throw data(
            {
                message: `fnr må være en string men var ${typeof fnr}`,
            },
            { status: 400 },
        )
    }
    if (!fnr) {
        throw data({ message: "Fant ikke fnr" }, { status: 400 })
    }

    try {
        logger.info("Starter oppfølging")
        const tokenOrResponse = await getOboToken(
            args.request,
            mapTilApp.veilarboppfolging,
        )
        if (tokenOrResponse.ok) {
            let response = await fetch(startOppfolgingUrl, {
                headers: {
                    ["Nav-Consumer-Id"]: "inngar",
                    Authorization: `Bearer ${tokenOrResponse.token}`,
                    ["Content-Type"]: "application/json",
                },
                body: JSON.stringify({ fnr, henviserSystem: "DEMO" }),
                method: "POST",
            }).then(async (proxyResponse) => {
                if (!proxyResponse.ok) {
                    logger.error(
                        `Dårlig respons ${proxyResponse.status}`,
                        await proxyResponse.text(),
                    )
                }
                return proxyResponse
            })
            if (!response.ok) {
                logger.error(`Start oppfølging feilet: ${response.status}`)
                return { error: await response.text() }
            }
            logger.info("Oppfølging startet")
        } else {
            return tokenOrResponse
        }
    } catch (e) {
        logger.error(
            "Kunne ikke opprette oppfolgingsperiode i veilarboppfolging",
            e,
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
    const fnrState = useFnrState()
    const fetcher = useFetcher()
    const error = fetcher.data?.error
    return (
        <div>
            <div className="flex flex-col w-[620px] m-8 p-4 space-y-4 mx-auto">
                <Heading size="large">
                    Registrering for arbeidsrettet oppfølging
                </Heading>

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
                </fetcher.Form>
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

export const ErrorBoundry = DefaultErrorBoundry
