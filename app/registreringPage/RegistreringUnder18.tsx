import {
    Alert,
    BodyShort,
    Box,
    Checkbox,
    ConfirmationPanel,
    Heading,
    List,
    ReadMore,
} from "@navikt/ds-react"
import { ListItem } from "@navikt/ds-react/List"

const RegistreringUnder18 = ({
    bekreftSamtykke,
}: {
    bekreftSamtykke: (checked: boolean) => void
}) => {
    return (
        <div>
            <Alert variant="warning" className="mb-5">
                <Heading size="small">
                    Personen må registreres av en veileder etter at en vurdering
                    er gjort
                </Heading>
                <List>
                    <ListItem>
                        <div>Bruker er under 18</div>
                    </ListItem>
                </List>
            </Alert>

            <div>
                <Box>
                    <List
                        as="ul"
                        size="small"
                        title="Hvorfor må jeg gjøre en vurdering av om personen skal
                        kunne registreres?"
                    >
                        <List.Item>
                            Det kreves samtykke fra foresatte for å kunne starte
                            oppfølging for mindreårige
                        </List.Item>
                        <div>
                            Du må opprette et notat og dokumentere vurderingene
                            i Gosys.
                        </div>
                    </List>
                </Box>

                <Box>
                    <List
                        as="ul"
                        size="small"
                        title="Før du starter oppfølging må du sørge for at:"
                    >
                        <List.Item>
                            Personen som skal registreres er informert og har
                            samtykket til registreringen
                        </List.Item>
                    </List>
                </Box>
            </div>
            <ConfirmationPanel
                label="Jeg bekrefter at de nødvendige vurderingene er gjort og
                dokumentert"
                onChange={(e) => bekreftSamtykke(e.target.checked)}
            />
        </div>
    )
}
export default RegistreringUnder18
