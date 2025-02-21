import { Heading } from "@navikt/ds-react/Typography"
import { Link, useSearchParams } from "react-router"
import type { ArenaReponseKoder } from "~/api/veilarboppfolging"
import { Alert, BodyShort, List } from "@navikt/ds-react"
import { getVeilarbpersonflateUrl } from "~/config.client"
import type { Route } from "./+types/registrert"

export const clientLoader = () => {
    return {
        veilarbpersonflateUrl: getVeilarbpersonflateUrl(),
    }
}

const SuccessPage = (props: Route.ComponentProps) => {
    const veilarbpersonflateUrl = props.loaderData.veilarbpersonflateUrl
    const [params] = useSearchParams()
    const result = params.get("result") as ArenaReponseKoder

    const getMessage = () => {
        switch (result) {
            case "FNR_FINNES_IKKE":
                return {
                    heading: "Vi finner ikke dette fødselsnummeret",
                    tekst: "Kan det ha sneket seg inn en skrivefeil?",
                }
            case "KAN_REAKTIVERES_FORENKLET":
                return {
                    heading: "Denne personen har blitt deaktivert i Arena",
                    tekst: "Det er mulig å reaktivere personen igjen i Arena, men med konsekvenser i tillegg til å starte personen for arbeidsrettet oppfølging:",
                    punkter: [
                        "Reaktivering vil gi personen tilbake ytelsen personen hadde før deaktivering uten at saksbehandling gjennomføres.",
                        "Reaktivering vil registrere personen som arbeidssøker.",
                    ],
                }
            case "UKJENT_FEIL":
                return {
                    heading: "Teknisk feil",
                    tekst: "Prøv igjen senere. Dersom feilen ikke forsvinner kan du rapportere dette i Porten. Husk å oppgi feilkoden i saken.",
                }
            default:
                return {
                    heading: "",
                    tekst: "Ukjent status for registreringen.",
                }
        }
    }

    const isSuccess =
        result === "OK_REGISTRERT_I_ARENA" ||
        result === "BRUKER_ALLEREDE_ARBS" ||
        result === "BRUKER_ALLEREDE_IARBS"

    return (
        <div className="flex flex-col space-y-4 w-[620px] p-4 mx-auto">
            <Heading size="large">
                {isSuccess
                    ? "Start arbeidsrettet oppfølging"
                    : "Registrering feilet"}
            </Heading>
            {isSuccess ? (
                <>
                    <Alert variant={"success"}>
                        <BodyShort>Registreringen var vellykket!</BodyShort>
                        <List size="small">
                            <List.Item>
                                Personen har tilgang til aktivitetsplan og
                                arbeidsrettet dialog
                            </List.Item>
                            <List.Item>
                                Det er mulig å gjøre $14a vurdering
                            </List.Item>
                        </List>
                    </Alert>
                    <Link to={`${veilarbpersonflateUrl}/aktivitetsplan`}>
                        Gå til aktivitetsplanen
                    </Link>
                    <Link to={`${veilarbpersonflateUrl}/dialog`}>
                        Gå til dialogen
                    </Link>
                    <Link to={`${veilarbpersonflateUrl}/vedtaksstotte`}>
                        Gå til 14a vurderingen
                    </Link>
                </>
            ) : (
                <Alert variant={"error"}>
                    <Heading size="small">{getMessage().heading}</Heading>
                    {getMessage().tekst}
                    {getMessage().punkter && (
                        <List>
                            {getMessage().punkter.map((punkt) => (
                                <List.Item>{punkt}</List.Item>
                            ))}
                        </List>
                    )}
                </Alert>
            )}
        </div>
    )
}

export default SuccessPage
