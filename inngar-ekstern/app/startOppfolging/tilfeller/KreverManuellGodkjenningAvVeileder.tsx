import { BodyShort, Heading, InfoCard } from "@navikt/ds-react"

export const KreverManuellGodkjenningAvVeileder = () => {
  return (
    <div className="gap-8 flex flex-col">
      <Heading size={"large"}>Mangler informasjon om lovlig opphold</Heading>
      <InfoCard data-color="info">
        <InfoCard.Header>
          <InfoCard.Title>
            Du må registreres for oppfolging av en veileder
          </InfoCard.Title>
        </InfoCard.Header>
        <InfoCard.Content>
          <BodyShort>
            Noen av opplysningene vi har hentet om deg må kontrolleres manuelt.
          </BodyShort>
          <br />
          <BodyShort>
            {" "}
            Ta kontakt med Nav for å bli registrert for oppfølging
          </BodyShort>
        </InfoCard.Content>
      </InfoCard>
    </div>
  )
}
