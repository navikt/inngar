import { Alert, BodyShort, Heading } from "@navikt/ds-react"
import type { KanIkkeStartePgaFolkeregisterStatus } from "~/api/veilarboppfolging"

const ugyldigStatusTekster: Record<
    KanIkkeStartePgaFolkeregisterStatus,
    { tittel: string; tekst: string }
> = {
    DOD: {
        tittel: "Bruker er registert død i folkeregisteret",
        tekst: "",
    },
    IKKE_LOVLIG_OPPHOLD: {
        tittel: "Bruker har ikke lovlig opphold i Norge",
        tekst: "Bare brukere med lovlig opphold kan registreres for arbeidsrettet oppfølging",
    },
    UKJENT_STATUS_FOLKEREGISTERET: {
        tittel: "Bruker har en ukjent status i folkeregisteret",
        tekst: "Bare brukere med lovlig opphold kan registreres for arbeidsrettet oppfølging",
    },
}

export const UgyldigFregStatusWarning = ({
    kanStarteOppfolging,
}: {
    kanStarteOppfolging: KanIkkeStartePgaFolkeregisterStatus
}) => {
    const tekster = ugyldigStatusTekster[kanStarteOppfolging]
    return (
        <Alert variant={"error"}>
            <Heading size="small">{tekster.tittel}</Heading>
            <BodyShort>{tekster.tekst}</BodyShort>
        </Alert>
    )
}
