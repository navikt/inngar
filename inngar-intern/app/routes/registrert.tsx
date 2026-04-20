import { Heading } from "@navikt/ds-react/Typography"
import { Link, useNavigate, useSearchParams } from "react-router"
import type { ArenaResponseKoder } from "~/api/veilarboppfolging"
import { Alert, List } from "@navikt/ds-react"
import { getVeilarbpersonflateUrl } from "~/config.client"
import type { Route } from "./+types/registrert"
import { useEffect } from "react"
import { loggLenkeKlikket, loggSkjemaFeilet, loggSkjemaFullført } from "common"

export const clientLoader = () => {
    return {
        veilarbpersonflateUrl: getVeilarbpersonflateUrl(),
    }
}

const getErrorMessage = (result: ArenaResponseKoder) => {
    switch (result) {
        case "FNR_FINNES_IKKE":
            return {
                heading: "Vi finner ikke dette fødselsnummeret",
                tekst: "Kan det ha sneket seg inn en skrivefeil?",
            }
        case "KAN_REAKTIVERES_FORENKLET":
            return {
                heading: "Denne brukeren har blitt deaktivert i Arena",
                tekst: "Det er mulig å reaktivere brukeren igjen i Arena, men med konsekvenser i tillegg til å starte brukeren for arbeidsrettet oppfølging:",
                punkter: [
                    "Reaktivering vil gi brukeren tilbake ytelsen brukeren hadde før deaktivering uten at saksbehandling gjennomføres.",
                    "Reaktivering vil registrere brukeren som arbeidssøker.",
                ],
            }
        case "UKJENT_FEIL":
            return {
                heading: "Teknisk feil",
                tekst: "Prøv igjen senere. Dersom feilen ikke forsvinner kan du rapportere dette i Porten.",
            }
        default:
            return {
                heading: "Det skjedde en feil",
                tekst: "Ukjent status for registreringen.",
            }
    }
}

const SuccessPage = (props: Route.ComponentProps) => {
    const veilarbpersonflateUrl = props.loaderData.veilarbpersonflateUrl
    const [params] = useSearchParams()
    const result = params.get("result") as ArenaResponseKoder
    const navigate = useNavigate()

    const isSuccess =
        result === "OK_REGISTRERT_I_ARENA" ||
        result === "BRUKER_ALLEREDE_ARBS" ||
        result === "BRUKER_ALLEREDE_IARBS"

    useEffect(() => {
        if (!isSuccess) {
            loggSkjemaFeilet(result)
        } else {
            loggSkjemaFullført(result)
        }
    }, [])

    const loggOgNaviger = (
        e: { preventDefault: () => void },
        url: string,
        lenkeTekst: string,
    ) => {
        e.preventDefault()
        loggLenkeKlikket(lenkeTekst)
        navigate(url)
    }

    const errorMessage = getErrorMessage(result)

    return (
        <div className="flex flex-col space-y-8 w-[620px] p-4 mx-auto">
            <Heading size="large">
                {isSuccess
                    ? "Start arbeidsrettet oppfølging"
                    : "Registrering feilet"}
            </Heading>
            {isSuccess ? (
                <>
                    <Alert variant="success">
                        <Heading size="small">
                            Denne brukeren er nå under arbeidsrettet oppfølging
                        </Heading>
                        <List>
                            <List.Item>
                                Brukeren har tilgang til aktivitetsplan og
                                arbeidsrettet dialog.
                            </List.Item>
                            <List.Item>
                                Det er mulig å gjøre oppfølgingsvedtak § 14 a.
                            </List.Item>
                        </List>
                    </Alert>
                    <div className="flex flex-col space-y-4">
                        <Link
                            className="underline"
                            to={`${veilarbpersonflateUrl}/aktivitetsplan`}
                            onClick={() =>
                                loggOgNaviger(
                                    { preventDefault: () => {} },
                                    `${veilarbpersonflateUrl}/aktivitetsplan`,
                                    "Gå til aktivitetsplanen",
                                )
                            }
                        >
                            Gå til aktivitetsplanen
                        </Link>
                        <Link
                            className="underline"
                            to={`${veilarbpersonflateUrl}/dialog`}
                            onClick={() =>
                                loggOgNaviger(
                                    { preventDefault: () => {} },
                                    `${veilarbpersonflateUrl}/dialog`,
                                    "Gå til dialogen",
                                )
                            }
                        >
                            Gå til dialogen
                        </Link>
                        <Link
                            className="underline"
                            to={`${veilarbpersonflateUrl}/vedtaksstotte`}
                            onClick={() =>
                                loggOgNaviger(
                                    { preventDefault: () => {} },
                                    `${veilarbpersonflateUrl}/vedtaksstotte`,
                                    "Gå til oppfølgingsvedtaket § 14 a",
                                )
                            }
                        >
                            Gå til oppfølgingsvedtaket § 14 a
                        </Link>
                    </div>
                </>
            ) : (
                <Alert variant={"error"}>
                    <Heading size="small">{errorMessage.heading}</Heading>
                    {errorMessage.tekst}
                    {errorMessage.punkter && (
                        <List>
                            {errorMessage?.punkter?.map((punkt, index) => (
                                <List.Item key={index}>{punkt}</List.Item>
                            ))}
                        </List>
                    )}
                </Alert>
            )}
        </div>
    )
}

export default SuccessPage
