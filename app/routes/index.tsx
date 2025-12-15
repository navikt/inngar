import type { Route } from "./+types/index"
import { Alert, Heading, List } from "@navikt/ds-react"
import { getOboToken } from "~/util/tokenExchange.server"
import { DefaultErrorBoundary } from "~/components/DefaultErrorBoundary"
import { apps } from "~/util/appConstants"
import {
    type KanIkkeStarteOppfolgingPgaIkkeTilgang,
    type KanIkkeStartePgaFolkeregisterStatus,
    VeilarboppfolgingApi,
} from "~/api/veilarboppfolging"
import { logger } from "../../server/logger"
import { dataWithTraceId } from "~/util/errorUtil"
import { IkkeTilgangWarning } from "~/registreringPage/IkkeTilgangWarning"
import { StartOppfolgingForm } from "~/registreringPage/StartOppfolgingForm"
import { UgyldigFregStatusWarning } from "~/registreringPage/UgyldigFregStatusWarning"
import Visittkort from "~/components/Visittkort"
import {
    userLoader,
    type UserLoaderSuccessResponse,
} from "~/registreringPage/userLoader"
import { BrukerStatus } from "~/registreringPage/BrukerStatus"
import { ListItem } from "@navikt/ds-react/List"
import { useEffect } from "react"
import { loggAlertVist } from "~/umami.client"
import { ReaktiveringsForm } from "~/registreringPage/ReaktiveringsForm.tsx"

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
    if (import.meta.env.DEV) {
        import("../mock/setupMockClient.client")
    }
    const serverData = await serverLoader()
    return {
        ...serverData,
    }
}

export async function loader({ request, params }: Route.LoaderArgs) {
    try {
        const fnrCode = params.fnrCode
        return userLoader(
            request,
            fnrCode,
        ) as unknown as Promise<UserLoaderSuccessResponse>
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
        { name: "inngar", content: "Start arbeidsrettet oppfølging" },
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
    const actionType = formdata.get("actionType")
    const fnr = formdata.get("fnr")
    if (!fnr || typeof fnr !== "string") {
        return {
            error: `Fødselsnummer er påkrevd men var:${fnr === null ? "null" : fnr}`,
        }
    }

    if (!actionType) {
        return { error: "actionType mangler" }
    }

    switch (actionType) {
        case "startOppfolging":
            return startOppfolging(args, fnr)
        case "reaktiverOppfolging":
            return reaktiverOppfolging(args, fnr)
        default:
            return { error: `Ukjent actionType: ${actionType}` }
    }
}

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

export function HydrateFallback() {
    return <p>Loading...</p>
}

const getTittel = (brukerStatus: BrukerStatus) => {
    if (
        brukerStatus ===
            BrukerStatus.ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT ||
        brukerStatus ===
            BrukerStatus.ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT_MEN_KREVER_MANUELL_GODKJENNING_PGA_IKKE_BOSATT ||
        brukerStatus ===
            BrukerStatus.ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT_MEN_KREVER_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS_GBR
    ) {
        return "Reaktiver arbeidsrettet oppfølging"
    } else {
        return "Start arbeidsrettet oppfølging"
    }
}

export default function Index({
    loaderData,
}: {
    loaderData: Awaited<ReturnType<typeof loader>>
}) {
    return (
        <>
            <Visittkort
                fnrState={{ loading: false, fnr: loaderData.fnr }}
                navKontor={loaderData.aktivtNavKontor}
            />
            <div className="flex flex-col w-[620px] p-4 mt-6 mx-auto space-y-8">
                <Heading size="large">{getTittel(loaderData.status)}</Heading>
                <IndexPage {...loaderData} />
            </div>
        </>
    )
}

const IndexPage = (props: Awaited<ReturnType<typeof loader>>) => {
    useEffect(() => {
        switch (props.status) {
            case BrukerStatus.INGEN_BRUKER_VALGT:
                loggAlertVist("info", "INGEN_BRUKER_VALGT")
                break
            case BrukerStatus.ALLEREDE_UNDER_OPPFOLGING:
                loggAlertVist("info", "ALLEREDE_UNDER_OPPFOLGING")
                break
            case BrukerStatus.UGYLDIG_BRUKER_FREG_STATUS:
                loggAlertVist("error", props.kanStarteOppfolging)
                break
            case BrukerStatus.IKKE_TILGANG:
                loggAlertVist("error", props.kanStarteOppfolging)
                break
        }
    }, [])

    switch (props.status) {
        case BrukerStatus.INGEN_BRUKER_VALGT:
            return <Alert variant="info">Ingen bruker valgt</Alert>
        case BrukerStatus.ALLEREDE_UNDER_OPPFOLGING:
            return (
                <Alert variant="success">
                    <Heading size="small">
                        Denne brukeren er allerede under arbeidsrettet
                        oppfølging
                    </Heading>
                    <List>
                        <ListItem>
                            Brukeren har tilgang til aktivitetsplan og
                            arbeidsrettet oppfølging.
                        </ListItem>
                        <ListItem>
                            Det er mulig å gjøre oppfølgingsvedtak § 14 a.
                        </ListItem>
                    </List>
                </Alert>
            )
        case BrukerStatus.IKKE_UNDER_OPPFOLGING:
        case BrukerStatus.KREVER_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS_GBR:
        case BrukerStatus.KREVER_MANUELL_GODKJENNING_PGA_IKKE_BOSATT:
            return (
                <StartOppfolgingForm
                    fnr={props.fnr}
                    navKontor={props.navKontor}
                    kreverManuellGodkjenningPgaIkkeBosatt={
                        props.status ===
                        BrukerStatus.KREVER_MANUELL_GODKJENNING_PGA_IKKE_BOSATT
                    }
                    kreverManuellGodkjenningPgaDnummerIkkeEosGbr={
                        props.status ===
                        BrukerStatus.KREVER_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS_GBR
                    }
                />
            )
        case BrukerStatus.ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT:
        case BrukerStatus.ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT_MEN_KREVER_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS_GBR:
        case BrukerStatus.ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT_MEN_KREVER_MANUELL_GODKJENNING_PGA_IKKE_BOSATT:
            return <ReaktiveringsForm fnr={props.fnr} />
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
