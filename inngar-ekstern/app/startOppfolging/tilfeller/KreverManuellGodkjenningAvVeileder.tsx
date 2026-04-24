import { BodyShort, Heading, InfoCard } from "@navikt/ds-react"

type ManuellGodkjenningÅrsak =
  | "JA_MED_MANUELL_GODKJENNING_PGA_IKKE_BOSATT"
  | "JA_MED_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS"
  | "IKKE_LOVLIG_OPPHOLD"
  | "UKJENT_STATUS_FOLKEREGISTERET"
  | "INGEN_STATUS_FOLKEREGISTERET"

const tekster: Record<
  ManuellGodkjenningÅrsak,
  { tittel: string; infokortTittel: string; beskrivelse: string }
> = {
  JA_MED_MANUELL_GODKJENNING_PGA_IKKE_BOSATT: {
    tittel: "Mangler informasjon om lovlig opphold",
    infokortTittel: "Du må hjelpes videre av en veileder",
    beskrivelse:
      "Noen av opplysningene vi har hentet om deg må kontrolleres manuelt.",
  },
  JA_MED_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS: {
    tittel: "Mangler informasjon om lovlig opphold",
    infokortTittel: "Du må hjelpes videre av en veileder",
    beskrivelse:
      "Noen av opplysningene vi har hentet om deg må kontrolleres manuelt.",
  },
  IKKE_LOVLIG_OPPHOLD: {
    tittel: "Du har ikke lovlig opphold",
    infokortTittel: "Du må hjelpes videre av en veileder",
    beskrivelse: "Ifølge våre opplysninger har du ikke lovlig opphold i Norge.",
  },
  UKJENT_STATUS_FOLKEREGISTERET: {
    tittel: "Ukjent status i Folkeregisteret",
    infokortTittel: "Du må hjelpes videre av en veileder",
    beskrivelse: "Vi finner ikke nødvendig informasjon i Folkeregisteret.",
  },
  INGEN_STATUS_FOLKEREGISTERET: {
    tittel: "Mangler informasjon i Folkeregisteret",
    infokortTittel: "Du må hjelpes videre av en veileder",
    beskrivelse: "Du er ikke registrert i Folkeregisteret.",
  },
}

export const KreverManuellGodkjenningAvVeileder = ({
  årsak,
}: {
  årsak?: ManuellGodkjenningÅrsak
}) => {
  const { tittel, infokortTittel, beskrivelse } =
    tekster[årsak ?? "JA_MED_MANUELL_GODKJENNING_PGA_IKKE_BOSATT"]

  return (
    <div className="gap-8 flex flex-col">
      <Heading size={"large"}>{tittel}</Heading>
      <InfoCard data-color="warning">
        <InfoCard.Header>
          <InfoCard.Title>{infokortTittel}</InfoCard.Title>
        </InfoCard.Header>
        <InfoCard.Content>
          <BodyShort>{beskrivelse}</BodyShort>
          <br />
          <BodyShort>
            Ta kontakt med Nav for å bli registrert for oppfølging
          </BodyShort>
        </InfoCard.Content>
      </InfoCard>
    </div>
  )
}
