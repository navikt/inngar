import { BodyShort, ConfirmationPanel, Heading, Link } from "@navikt/ds-react"

const ManuellGodkjenningIkkeBosattAlert = ({
    bekreftGodkjenning,
}: {
    bekreftGodkjenning: (godkjent: boolean) => void
}) => {
    return (
        <ConfirmationPanel
            label="Denne personen har lovlig opphold i Norge, og vurderingen av dette er dokumentert i Gosys (obligatorisk)"
            onChange={(e) => bekreftGodkjenning(e.target.checked)}
        >
            <Heading size="small">Ikke bosatt i Norge</Heading>
            <BodyShort className="pt-4">
                Denne personen har kanskje ikke rett på arbeidsrettet oppfølging
                fordi statusen i Folkeregisteret er "ikke bosatt". Gjør en{" "}
                <Link
                    inlineText
                    underline
                    href="navno.sharepoint.com/sites/fag-og-ytelser-regelverk-og-rutiner/SitePages/Vurdering-av-oppholdsrett,-lovlig-opphold-og-avslag-etter-Nav-loven-§-14-a.aspx"
                >
                    vurdering av lovlig opphold og avslag etter Nav-loven § 14 a
                </Link>
                .
            </BodyShort>
        </ConfirmationPanel>
    )
}
export default ManuellGodkjenningIkkeBosattAlert
