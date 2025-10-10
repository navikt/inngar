import { BodyShort, ConfirmationPanel, Heading, Link } from "@navikt/ds-react"

const ManuellGodkjenningMidlertidigBosattAlert = ({
    bekreftGodkjenning,
}: {
    bekreftGodkjenning: (godkjent: boolean) => void
}) => {
    return (
        <ConfirmationPanel
            label="Denne personen har lovlig opphold i Norge, og vurderingen av dette er dokumentert i Gosys (obligatorisk)"
            onChange={(e) => bekreftGodkjenning(e.target.checked)}
        >
            <Heading size="small">Midlertidig bosatt i Norge</Heading>
            <BodyShort className="pt-4">
                Denne personen har kanskje ikke rett på arbeidsoppfølging fordi
                statusen i Folkeregisteret er “midlertidig bosatt” (d-nummer),
                og personen er ikke statsborger i EU/EØS eller GBR. Gjør en{" "}
                <Link
                    inlineText
                    underline
                    href="https://lovdata.no/lov/2006-06-16-20/§14a"
                >
                    vurdering av lovlig opphold og avslag etter Nav-loven § 14 a
                </Link>
                .
            </BodyShort>
        </ConfirmationPanel>
    )
}
export default ManuellGodkjenningMidlertidigBosattAlert
