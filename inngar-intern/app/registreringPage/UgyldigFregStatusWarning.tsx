import { Alert, BodyShort, Heading, Link, List } from "@navikt/ds-react"
import type { KanIkkeStartePgaFolkeregisterStatus } from "~/api/veilarboppfolging"
import { ListItem } from "@navikt/ds-react/List"

interface Lenke {
    tekst: string
    lenke: string
}

const ugyldigStatusTekster: Record<
    KanIkkeStartePgaFolkeregisterStatus,
    { tittel: string; tekst: string; lenker?: Array<Lenke> }
> = {
    DOD: {
        tittel: "Denne brukeren er registrert død i folkeregisteret",
        tekst: "",
    },
    IKKE_LOVLIG_OPPHOLD: {
        tittel: "Denne brukeren har ikke lovlig opphold i Norge",
        tekst: "Følg servicerutinen og gi avslag på arbeidsrettet oppfølging.",
        lenker: [
            {
                tekst: "Mal for avslag til utsendelse gjennom fagsystemet Gosys",
                lenke: "https://navno-my.sharepoint.com/:w:/g/personal/asa_bjorno_Nav_no/Ef5tbcEwvHRBk-cMYbtR35QB_148Ikca4BDfbkNkXCIcJg?e=xBJSHO",
            },
            {
                tekst: "Vurdering av lovlig opphold og avslag etter Nav-loven § 14 a",
                lenke: "https://navno.sharepoint.com/sites/fag-og-ytelser-regelverk-og-rutiner/SitePages/Vurdering-av-oppholdsrett,-lovlig-opphold-og-avslag-etter-NAV-loven-%C2%A7-14-a.aspx?web=1",
            },
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
        <>
            <Alert variant={"error"}>
                <Heading size="small">{tekster.tittel}</Heading>
                <BodyShort>{tekster.tekst}</BodyShort>
                {tekster.lenker && (
                    <List>
                        {tekster.lenker.map((punkt) => (
                            <ListItem>
                                <Link href={punkt.lenke}>{punkt.tekst}</Link>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Alert>
            {kanStarteOppfolging === "IKKE_LOVLIG_OPPHOLD" ? (
                <Alert variant="info" inline>
                    <p>
                        Vi har oppdaget en feil som berører EU/EØS-brukere som
                        ikke er bosatt i Norge. Vi arbeider med å rette feilen,
                        slik at disse brukerne skal kunne få tilgang til
                        arbeidsrettet oppfølging.
                    </p>
                </Alert>
            ) : null}
        </>
    )
}
