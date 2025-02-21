import { useFetcher } from "react-router"
import { isUnder18 } from "~/util/erUnder18Helper"
import { useState } from "react"
import {
    Alert,
    BodyShort,
    Button,
    ErrorSummary,
    Heading,
    Link,
} from "@navikt/ds-react"
import RegistreringUnder18 from "~/registreringPage/RegistreringUnder18"
import { NavKontorInfo } from "~/registreringPage/NavKontorInfo"
import { loggSkjemaFullført } from "~/amplitude.client"

const arbeidssokerRegistreringUrl =
    "https://arbeidssokerregistrering-for-veileder.intern.dev.nav.no/" // import.meta.env.ARBEIDSSOKERREGISTRERING_URL

export interface NavKontor {
    navn: string
    id: string
    kilde: string
}

export const StartOppfolgingForm = ({
    navKontor,
    fnr,
}: {
    navKontor: NavKontor | null
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
        <div className="flex flex-col space-y-8 mx-auto">
            {brukerErUnder18 ? (
                <RegistreringUnder18 bekreftSamtykke={setErSamtykkeBekreftet} />
            ) : null}
            <NavKontorInfo enhet={navKontor} />
            <Alert inline variant={"info"}>
                <div className="space-y-4">
                    <BodyShort>
                        Personen blir ikke registrert som arbeidssøker når du
                        starter arbeidsrettet oppfølging for en innbygger her.
                        Dersom innbyggeren også er arbeidssøker bør du benytte{" "}
                        <Link href={arbeidssokerRegistreringUrl}>
                            arbeidssøkerregistreringen.
                        </Link>
                    </BodyShort>
                </div>
            </Alert>
            <Alert inline variant={"info"}>
                <div className="space-y-4">
                    <BodyShort>
                        Registreringen for arbeidsrettet oppfølging medfører
                        ikke at personen får noen meldeplikt.
                    </BodyShort>
                </div>
            </Alert>
            <Alert inline variant={"info"}>
                <div className="space-y-4">
                    <BodyShort>
                        Personen vil få informasjon på Min Side om at det er
                        startet arbeidsrettet oppfølging.
                    </BodyShort>
                </div>
            </Alert>

            <fetcher.Form
                method="post"
                className="space-y-4"
                onSubmit={loggSkjemaFullført}
            >
                {error ? <FormError message={error} /> : null}
                <input type="hidden" name="fnr" value={fnr} />
                <Button
                    disabled={brukerErUnder18 && !erSamtykkeBekreftet}
                    loading={fetcher.state == "submitting"}
                >
                    Start arbeidsrettet oppfølging
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
