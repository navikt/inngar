import {
    Alert,
    Heading,
    List,
    TextField,
    UNSAFE_Combobox as Combobox,
} from "@navikt/ds-react"
import { Suspense, useState } from "react"
import { Await } from "react-router"
import type { NavKontor } from "~/registreringPage/StartOppfolgingForm"
import { useFeatureToggle } from "~/hooks/useFeatureToggle"

const beskrivelseTekst =
    "Brukeren blir lagt til i porteføljen til denne enheten"

const IngenKontorAlert = () => (
    <Alert variant="warning">
        <Heading size="small">Fant ikke enhet</Heading>
        Brukeren har sannsynligvis ingen registrert bostedsadresse i Norge, men
        du kan fortsatt starte arbeidsrettet oppfølging for brukeren.
        <List>
            <List.Item>
                Enhet kan bli tildelt basert på en automatisk sjekk av
                eventuelle tidligere arbeidsgiveres adresse.
            </List.Item>
            <List.Item>
                Hvis ingen annen passende enhet blir funnet vil brukeren
                midlertidig bli tildelt enhet 2990, som vil gjøre en manuell
                vurdering av enhet.
            </List.Item>
        </List>
    </Alert>
)

export const NavKontorInfo = ({
    enhet,
    kontorOptions,
}: {
    enhet: Promise<NavKontor | null | undefined>
    kontorOptions?: Promise<NavKontor[]>
}) => {
    const kanOverstyreKontor = useFeatureToggle("inngar.overstyr-kontor")
    const [selectedKontorId, setSelectedKontorId] = useState<string | null>(
        null,
    )

    return (
        <Suspense
            fallback={
                <TextField
                    disabled
                    label="Oppfølgingsenhet"
                    description={beskrivelseTekst}
                    value={``}
                    readOnly
                />
            }
        >
            <Await resolve={enhet}>
                {(kontor) => {
                    if (!kontor) {
                        return <IngenKontorAlert />
                    }

                    if (!kanOverstyreKontor || !kontorOptions) {
                        return (
                            <TextField
                                label="Oppfølgingsenhet"
                                description={beskrivelseTekst}
                                value={`${kontor.navn} (${kontor.id})`}
                                readOnly
                            />
                        )
                    }

                    return (
                        <Suspense
                            fallback={
                                <TextField
                                    label="Oppfølgingsenhet"
                                    description={beskrivelseTekst}
                                    value={`${kontor.navn} (${kontor.id})`}
                                    readOnly
                                />
                            }
                        >
                            <Await resolve={kontorOptions}>
                                {(kontorList) => {
                                    // Initialize selected kontor to default if not set
                                    if (!selectedKontorId) {
                                        setSelectedKontorId(kontor)
                                    }

                                    const displayKontor =
                                        selectedKontorId || kontor.id

                                    // Only send kontorSattAvVeileder if it differs from the default
                                    const isManuallyOverridden =
                                        displayKontor.id !== kontor.id

                                    return (
                                        <>
                                            <Combobox
                                                defaultValue={`${kontor.id} - ${kontor.navn}`}
                                                label="Oppfølgingsenhet"
                                                options={kontorList.map(
                                                    (it) => ({
                                                        label: `${it.id} ${it.navn}`,
                                                        value: it.id,
                                                    }),
                                                )}
                                                description={beskrivelseTekst}
                                                // value={displayKontor.id}
                                                onToggleSelected={(
                                                    selectedKontorId,
                                                ) => {
                                                    if (selectedKontorId) {
                                                        setSelectedKontorId(
                                                            selectedKontorId,
                                                        )
                                                    }
                                                }}
                                            />
                                            {isManuallyOverridden && (
                                                <input
                                                    type="hidden"
                                                    name="kontorSattAvVeileder"
                                                    value={displayKontor.id}
                                                />
                                            )}
                                        </>
                                    )
                                }}
                            </Await>
                        </Suspense>
                    )
                }}
            </Await>
        </Suspense>
    )
}
