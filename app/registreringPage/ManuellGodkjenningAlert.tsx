import {
    BodyLong,
    BodyShort,
    ConfirmationPanel,
    Heading,
} from "@navikt/ds-react"
import {
    BrukerStatus,
    type BrukerStatusSomKreverManuellGodkjenning,
} from "~/registreringPage/BrukerStatus.ts"

const tekster: Record<BrukerStatusSomKreverManuellGodkjenning, string> = {
    [BrukerStatus.KREVER_MANUELL_GODKJENNING_PGA_IKKE_BOSATT]:
        'Bruker har status "Ikke bosatt" i Norge',
    [BrukerStatus.KREVER_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS_GBR]:
        "Bruker har status midlertidig eller inaktiv i folkeregisteret og er ikke statsborger i EU/EØS eller GBR.",
    [BrukerStatus.ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT_MEN_KREVER_MANUELL_GODKJENNING_PGA_IKKE_BOSATT]:
        'Bruker har status "Ikke bosatt" i Norge',
    [BrukerStatus.ALLEREDE_UNDER_OPPFOLGING_MEN_INAKTIVERT_MEN_KREVER_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS_GBR]:
        "Bruker har status midlertidig eller inaktiv i folkeregisteret og er ikke statsborger i EU/EØS eller GBR.",
}

export const ManuellGodkjenningAlert = ({
    brukerStatus,
    bekreftGodkjenning,
}: {
    brukerStatus: BrukerStatusSomKreverManuellGodkjenning
    bekreftGodkjenning: (godkjent: boolean) => void
}) => {
    return (
        <ConfirmationPanel
            label="Jeg bekrefter at de nødvendige vurderingene er gjort og dokumentert i Gosys (obligatorisk)"
            onChange={(e) => bekreftGodkjenning(e.target.checked)}
        >
            <Heading size="small">
                Person har ikke lovlig opphold ifølge Folkeregisteret
            </Heading>
            <BodyShort>{tekster[brukerStatus]}</BodyShort>
            <BodyLong>
                Du må opprette et notat og dokumentere i Gosys om bruker har
                lovlig opphold.
            </BodyLong>
        </ConfirmationPanel>
    )
}
