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
    List,
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
            <NavKontorInfo enhet={navKontor} />
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
