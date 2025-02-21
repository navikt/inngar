import { Alert, BodyShort, Heading, List } from "@navikt/ds-react"
import type { KanIkkeStartePgaFolkeregisterStatus } from "~/api/veilarboppfolging"
import { ListItem } from "@navikt/ds-react/List"

const ugyldigStatusTekster: Record<
    KanIkkeStartePgaFolkeregisterStatus,
    { tittel: string; tekst: string; listePunkter: Array<string> }
> = {
    DOD: {
        tittel: "Bruker er registert død i folkeregisteret",
        tekst: "",
    },
    IKKE_LOVLIG_OPPHOLD: {
        tittel: "Denne personen har ikke lovlig opphold i Norge",
        tekst: "Følg servicerutinen og gi avslag på arbeidsrettet oppfølging.",
        listePunkter: [
            "Mal for avslag til utsendelse gjennom fagsystemet Gosys",
            "Vurdering av lovlig opphold og avslag etter Nav-loven § 14 a",
        ],
    },
    UKJENT_STATUS_FOLKEREGISTERET: {
        tittel: "Bruker har en ukjent status i folkeregisteret",
        tekst: "Bare brukere med lovlig opphold kan registreres for arbeidsrettet oppfølging",
    },
    INGEN_STATUS_FOLKEREGISTERET: {
        tittel: "Bruker har ingen registrert en status i folkeregisteret",
        tekst: "Bare brukere med lovlig opphold kan registreres for arbeidsrettet oppfølging. Uten noen registrert status i folkeregisteret kan vi ikke vite om bruker har lovlig oppfhold.",
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
            {tekster.listePunkter && (
                <List>
                    {tekster.listePunkter.map((punkt) => (
                        <ListItem key={punkt}>{punkt}</ListItem>
                    ))}
                </List>
            )}
        </Alert>
    )
}
