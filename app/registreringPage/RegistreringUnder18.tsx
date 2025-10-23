import { ConfirmationPanel, Heading, Link, List } from "@navikt/ds-react"
import { ListItem } from "@navikt/ds-react/List"

const urlSamtykkeNavet =
    "https://navno.sharepoint.com/sites/fag-og-ytelser-regelverk-og-rutiner/SitePages/Servicerutine-for-innhenting-av-samtykke-fra-foresatte-for-unge-under-18-%C3%A5r-ved-registrering-som-arbeidss%C3%B8ker,.aspx"
const RegistreringUnder18 = ({
    bekreftSamtykke,
}: {
    bekreftSamtykke: (checked: boolean) => void
}) => {
    return (
        <div>
            <ConfirmationPanel
                label="Jeg bekrefter at de nødvendige vurderingene er gjort og dokumentert i Gosys (obligatorisk)"
                onChange={(e) => bekreftSamtykke(e.target.checked)}
            >
                <Heading size="small">Denne brukeren er under 18 år</Heading>
                <List>
                    <ListItem>
                        Det kreves et samtykke fra foresatte for å kunne starte
                        oppfølging.{" "}
                        <Link
                            variant="neutral"
                            href={urlSamtykkeNavet}
                            target="_blank"
                        >
                            Følg retningslinjene for samtykke på Navet.
                        </Link>
                    </ListItem>
                    <ListItem>
                        Du må opprette et notat og dokumentere vurderingen i
                        Gosys.
                    </ListItem>
                </List>
            </ConfirmationPanel>
        </div>
    )
}
export default RegistreringUnder18
