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
∂
const SuccessPage = (props: Route.ComponentProps) => {
    const veilarbpersonflateUrl = props.loaderData.veilarbpersonflateUrl
    const [params] = useSearchParams()
    const result = params.get("result") as ArenaReponseKoder

    const getMessage = () => {
        switch (result) {
            case "OK_REGISTRERT_I_ARENA":
                return "Registreringen var vellykket!"
            case "FNR_FINNES_IKKE":
                return "Klarte ikke finne bruker."
            case "KAN_REAKTIVERES_FORENKLET":
                return "Brukere som kan reaktiveres i Arena kan ikke registreres for arbeidsoppfølging."
            case "BRUKER_ALLEREDE_ARBS":
                return "Registreringen var vellykket!"
            case "BRUKER_ALLEREDE_IARBS":
                return "Registreringen var vellykket!"
            case "UKJENT_FEIL":
                return "Ukjent feil oppstod under registreringen."
            default:
                return "Ukjent status for registreringen."
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
                    <p className="text-lg">{getMessage()}</p>
                </Alert>
            )}
        </div>
    )
}

export default SuccessPage
