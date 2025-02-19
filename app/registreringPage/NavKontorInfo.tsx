import { Alert, BodyShort, List, TextField } from "@navikt/ds-react"
import type { NavKontor } from "~/registreringPage/StartOppfolgingForm"

export const NavKontorInfo = ({
    enhet,
}: {
    enhet: NavKontor | null | undefined
}) => {
    if (enhet === null || enhet === undefined) {
        return (
            <Alert variant="warning">
                Fant ikke ingen nav kontor til brukeren - brukeren har mest
                sannsynlig ikke registrert bostedsaddresse i Norge.
                <List>
                    <List.Item>
                        Hvis bruker har tidligere arbeidsgiver og kommer nav
                        kontor til å bli utledet av forrige arbeidsgivers
                        addresse
                    </List.Item>
                    <List.Item>
                        Hvis ingen annet passende nav kontor er funnet kommer
                        bruker til å bli tilordnet kontor 2990 (IT-avdelingen)
                    </List.Item>
                </List>
            </Alert>
        )
    }

    const kilde = enhet.kilde === "ARENA" ? "Arena" : "Geografisk tilknytning"
    const beskrivelseTekst =
        enhet.kilde === "ARENA"
            ? "Bruker er registrert på følgende nav-kontor i Arena:"
            : "Bruker blir tildelt følgende nav-kontor etter geografisk tilknytning:"

    return (
        <>
            <TextField
                label="Oppfølgingskontor"
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
