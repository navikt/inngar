import type { KanIkkeStarteOppfolgingPgaIkkeTilgang } from "~/api/veilarboppfolging"
import { Alert, BodyShort, Heading } from "@navikt/ds-react"

const ikkeTilgangTekst: Record<
    KanIkkeStarteOppfolgingPgaIkkeTilgang,
    { tittel: string; tekst: string }
> = {
    IKKE_TILGANG_EGNE_ANSATTE: {
        tittel: "Denne personen er skjermet (egen ansatt)",
        tekst: "Bare veiledere med tilgang til skjermede ansatte kan behandle denne personens saker.",
    },
    IKKE_TILGANG_FORTROLIG_ADRESSE: {
        tittel: "Brukeren har fortrolig adresse",
        tekst: "For å starte brukeren på arbeidsrettet oppfølging må du sende en oppgave til Vikafossen (tidigere Nav Viken).",
    },
    IKKE_TILGANG_MODIA: {
        tittel: "Du har ikke tilgang til Modia arbeidsrettet oppfølging",
        tekst: "Du får tilgang til Modia via din identansvarlige. Din nærmeste leder skal godkjenne tilgangen.",
    },
    IKKE_TILGANG_STRENGT_FORTROLIG_ADRESSE: {
        tittel: "Brukeren har strengt fortrolig adresse",
        tekst: "For å starte brukeren på arbeidsrettet oppfølging må du sende en oppgave til Vikafossen (tidigere Nav Viken).",
    },
    IKKE_TILGANG_ENHET: {
        tittel: "Ikke tilgang til enhet",
        tekst: "Du har ikke tilgang til brukerens enhet",
    },
}

export const IkkeTilgangWarning = ({
    kanStarteOppfolging,
}: {
    kanStarteOppfolging: KanIkkeStarteOppfolgingPgaIkkeTilgang
}) => {
    const tekster = ikkeTilgangTekst[kanStarteOppfolging]
    return (
        <Alert variant={"error"}>
            <Heading size="small">{tekster.tittel}</Heading>
            <BodyShort>{tekster.tekst}</BodyShort>
        </Alert>
    )
}
