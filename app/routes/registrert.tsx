import { CheckmarkCircleIcon, XMarkOctagonIcon } from "@navikt/aksel-icons"
import { Heading } from "@navikt/ds-react/Typography"
import { Link, useSearchParams } from "react-router"
import type { ArenaReponseKoder } from "~/api/veilarboppfolging"

type SuccessPageProps = {
    // Add props if needed in the future
}

const aktivitetsplanUrl = import.meta.env.VITE_AKTIVITETSPLAN_URL

const SuccessPage = (props: SuccessPageProps) => {
    const [params] = useSearchParams()
    const result = params.get("result") as ArenaReponseKoder

    const getMessage = () => {
        switch (result) {
            case "OK_REGISTRERT_I_ARENA":
                return "Registreringen var vellykket!"
            case "FNR_FINNES_IKKE":
                return "Klarte ikke finne bruker."
            case "KAN_REAKTIVERES_FORENKLET":
                return "Brukere som kan reaktiveres kan ikke registreres for arbeidsoppfølging."
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
                {isSuccess ? "Registrering ok" : "Registrering feilet"}
            </Heading>
            <div className="flex flex-col  gap-2">
                {isSuccess ? (
                    <CheckmarkCircleIcon className="w-10 h-10 text-green-500" />
                ) : (
                    <XMarkOctagonIcon className="w-10 h-10 text-red-500" />
                )}
                <p className="text-lg">{getMessage()}</p>
                {isSuccess && (
                    <Link to={aktivitetsplanUrl}>
                        Gå tilbake til aktivitetsplanen
                    </Link>
                )}
            </div>
        </div>
    )
}

export default SuccessPage
