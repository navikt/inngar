import { Alert, BodyShort, Heading, List, TextField } from "@navikt/ds-react"
import type { NavKontor } from "~/registreringPage/StartOppfolgingForm"

export const NavKontorInfo = ({
    enhet,
}: {
    enhet: NavKontor | null | undefined
}) => {
    if (enhet === null || enhet === undefined) {
        return (
            <Alert variant="warning">
                <Heading size="small">Fant ikke enhet</Heading>
                Brukeren har sannsynligvis ingen registrert bostedsadresse i
                Norge, men du kan fortsatt starte arbeidsrettet oppfølging for
                brukeren.
                <List>
                    <List.Item>
                        Enhet kan bli tildelt basert på en automatisk sjekk av
                        eventuelle tidligere arbeidsgiveres adresse.
                    </List.Item>
                    <List.Item>
                        Hvis ingen annen passende enhet blir funnet vil brukeren
                        midlertidig bli tildelt enhet 2990, som vil gjøre en
                        manuell vurdering av enhet.
                    </List.Item>
                </List>
            </Alert>
        )
    }

    const kilde = enhet.kilde === "ARENA" ? "Arena" : "Geografisk tilknytning"
    const beskrivelseTekst =
        "Brukeren blir lagt til i porteføljen til denne enheten"

    return (
        <>
            <TextField
                label="Oppfølgingsenhet"
                description={beskrivelseTekst}
                value={`${enhet.navn} (${enhet.id}) - ${kilde}`}
                readOnly
            />
        </>
    )
}
