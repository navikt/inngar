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
    TextField,
} from "@navikt/ds-react"
import RegistreringUnder18 from "~/components/RegistreringUnder18"
import type { Enhet } from "~/components/decoratorProps"

const arbeidssokerRegistreringUrl =
    "https://arbeidssokerregistrering-for-veileder.intern.dev.nav.no/" // import.meta.env.ARBEIDSSOKERREGISTRERING_URL

export const StartOppfolgingForm = ({
    enhet,
    fnr,
}: {
    enhet: Enhet | null
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

            <fetcher.Form method="post" className="space-y-4">
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

const EnhetsInfo = ({ enhet }: { enhet: Enhet | null | undefined }) => {
    if (enhet === null || enhet === undefined) {
        return (
            <Alert variant="warning">
                Fant ikke enhet - brukeren har mest sannsynlig ikke registrert
                bostedsaddresse i Norge.
                <List>
                    <List.Item>
                        Hvis bruker har tidligere arbeidsgiver og kommer enhet
                        til å bli utledet av forrige arbeidsgivers addresse
                    </List.Item>
                    <List.Item>
                        Hvis ingen annen passende enhet er funnet kommer bruker
                        til å bli tilordnet enhet 2990 (IT-avdelingen)
                    </List.Item>
                </List>
            </Alert>
        )
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
