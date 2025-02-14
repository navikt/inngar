import type { KanIkkeStarteOppfolgingPgaIkkeTilgang } from "~/api/veilarboppfolging"
import { Alert, BodyShort, Heading } from "@navikt/ds-react"

const ikkeTilgangTekst: Record<
    KanIkkeStarteOppfolgingPgaIkkeTilgang,
    { tittel: string; tekst: string }
> = {
    IKKE_TILGANG_EGNE_ANSATTE: {
        tittel: "Bruker er ansatt i NAV",
        tekst: "Du har ikke tilgang til egne ansatte",
    },
    IKKE_TILGANG_FORTROLIG_ADRESSE: {
        tittel: "Bruker har fortrolig adresse",
        tekst: "Du har ikke tilgang til brukere med fortrolig adresse",
    },
    IKKE_TILGANG_MODIA: {
        tittel: "Ikke tilgang til Modia",
        tekst: "Du har ikke tilgang til Modia",
    },
    IKKE_TILGANG_STRENGT_FORTROLIG_ADRESSE: {
        tittel: "Ikke tilgang - strengt fortrolig adresse",
        tekst: "Du har ikke tilgang til brukere med strengt fortrolig adresse",
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
