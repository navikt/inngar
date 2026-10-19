import {
  Accordion,
  BodyLong,
  GuidePanel,
  Heading,
  List,
} from "@navikt/ds-react"

export function AvsluttOppfolgingInnhold() {
  return (
    <>
      <GuidePanel poster>
        {/* TODO: Personlig hilsen og endelige informasjonstekster avklares. */}
        <Heading level="2" size="medium" spacing>
          Hei!
        </Heading>
        <BodyLong>
          Du får arbeidsrettet oppfølging fra Nav. Med arbeidsrettet oppfølging
          kan du blant annet få:
        </BodyLong>
        <List>
          <List.Item>Samtaler med veileder</List.Item>
          <List.Item>Arbeidsrettede tiltak eller kurs</List.Item>
          <List.Item>Veiledning og hjelp tilpasset din situasjon</List.Item>
        </List>
        <BodyLong weight="semibold">
          Hvis du mener at du ikke lenger trenger denne oppfølgingen, kan du
          avslutte den nå.
        </BodyLong>
      </GuidePanel>
      <div>
        <Heading level="2" size="large" spacing>
          Før du avslutter oppfølgingen din
        </Heading>
        <BodyLong spacing>
          Når du melder deg av arbeidsrettet oppfølging, slutter Nav å hjelpe
          deg med å komme i jobb eller beholde jobben din. Du har ikke lenger en
          veileder som følger deg opp. Nav vurderer heller ikke lenger om du
          trenger tiltak, kurs eller annen støtte.
        </BodyLong>
        <BodyLong spacing>
          Hvis situasjonen din endrer seg, kan du kontakte Nav og be om en ny
          vurdering.
        </BodyLong>
        <BodyLong spacing>
          Er du usikker på om du bør avslutte? Snakk med veilederen din først.
        </BodyLong>
        <Accordion>
          <Accordion.Item defaultOpen>
            <Accordion.Header>Informasjonen vi henter om deg</Accordion.Header>
            <Accordion.Content>
              Her skal det stå informasjon om hvor vi vil hente opplysninger om
              søkeren og hva slags opplysninger vi henter.
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>
              Hvordan vi behandler personopplysninger
            </Accordion.Header>
            <Accordion.Content>TODO: Endelig tekst</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>Automatisk saksbehandling</Accordion.Header>
            <Accordion.Content>TODO: Endelig tekst</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </div>
    </>
  )
}
