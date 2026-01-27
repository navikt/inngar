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
                                    value={kontorNavn(kontor)}
                                    readOnly
                                />
                            }
                        >
                            <Await resolve={kontorOptions}>
                                {(kontorList) => (
                                    <KontorVelger
                                        kontor={kontor}
                                        kontorList={kontorList}
                                    />
                                )}
                            </Await>
                        </Suspense>
                    )
                }}
            </Await>
        </Suspense>
    )
}

const KontorVelger = ({
    kontor,
    kontorList,
}: {
    kontor: NavKontor
    kontorList: NavKontor[]
}) => {
    const defaultKontor = kontorList.find((it) => it.id === kontor.id)
    const [selectedKontor, setSelectedKontor] = useState<NavKontor | null>(
        defaultKontor ?? null,
    )
    // const displayKontor = selectedKontor || kontor

    // Only send kontorSattAvVeileder if it differs from the default
    const isManuallyOverridden =
        selectedKontor && selectedKontor.id !== kontor.id

    return (
        <>
            <Combobox
                defaultValue={
                    selectedKontor ? kontorNavn(selectedKontor) : undefined
                }
                label="Oppfølgingsenhet"
                options={kontorList.map((it) => kontorNavn(it))}
                description={beskrivelseTekst}
                selectedOptions={
                    selectedKontor ? [kontorNavn(selectedKontor)] : undefined
                }
                onToggleSelected={(selectedKontorId) => {
                    const navKontor = kontorList.find(
                        (it) => kontorNavn(it) == selectedKontorId,
                    )
                    setSelectedKontor(navKontor ?? null)
                }}
            />
            {isManuallyOverridden && selectedKontor && (
                <input
                    type="hidden"
                    name="kontorSattAvVeileder"
                    value={selectedKontor.id}
                />
            )}
        </>
    )
}

const kontorNavn = (navKontor: NavKontor) => `${navKontor.id} ${navKontor.navn}`
