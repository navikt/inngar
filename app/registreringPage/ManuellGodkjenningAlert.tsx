import { ConfirmationPanel, Heading, List } from "@navikt/ds-react"

export const ManuellGodkjenningAlert = ({
    bekreftGodkjenning,
}: {
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
            <List>
                <List.Item>
                    Bruker har enten status "Ikke bosatt" i Norge eller er
                    midlertidig bosatt og er ikke statsborger i EU/EØS eller
                    GBR.
                </List.Item>
                <List.Item>
                    Du må opprette et notat og dokumentere i Gosys om bruker har
                    lovlig opphold.
                </List.Item>
            </List>
        </ConfirmationPanel>
    )
}
