import {
  BodyShort,
  Button,
  Heading,
  InfoCard,
  List,
  LocalAlert,
} from "@navikt/ds-react"
import { useFetcher } from "react-router"
import type { KanStarteOppfolgingEkstern } from "~/api/veilarboppfolging"
import { InnholdForDegUnderOppfolging } from "~/startOppfolging/InnholdForDegUnderOppfolging"
import SkjemaIkon from "./skjema-ikon.svg?react"
import { PaperplaneIcon } from "@navikt/aksel-icons"

type KanStarteOppfolgingResponse =
  | {
      data: {
        oppfolging: {
          kanStarteOppfolgingEkstern: KanStarteOppfolgingEkstern
        }
      }
    }
  | {
      ok: false
      error: Error
    }

export function KanStarteOppfolgingPage({
  kanStarteOppfolging,
}: {
  kanStarteOppfolging: KanStarteOppfolgingResponse
}) {
  if ("error" in kanStarteOppfolging) {
    return (
      <main className="flex items-center justify-center pt-4 md:pt-12 pb-4 p-4">
        <div className="max-w-paragraph-width flex-1 flex flex-col gap-8 min-h-96 min-h-0">
          <LocalAlert status={"error"}>
            <LocalAlert.Header>
              <LocalAlert.Title>Noe gikk galt</LocalAlert.Title>
            </LocalAlert.Header>
            <LocalAlert.Content>
              {kanStarteOppfolging?.error?.message}
            </LocalAlert.Content>
          </LocalAlert>
        </div>
      </main>
    )
  } else {
    return (
      <main className="flex justify-center gap-8 pt-4 md:pt-12 pb-4 p-4">
        <SkjemaIkon />
        <div className="max-w-paragraph-width flex-1 flex flex-col gap-8 min-h-96 min-h-0">
          <KanStarteOppfolgingForm
            kanStarteOppfolging={
              kanStarteOppfolging.data.oppfolging.kanStarteOppfolgingEkstern
            }
          />
        </div>
      </main>
    )
  }
}

const KanStarteOppfolgingForm = ({
  kanStarteOppfolging,
}: {
  kanStarteOppfolging: KanStarteOppfolgingEkstern
}) => {
  switch (kanStarteOppfolging) {
    case "JA":
      return <StartOppfolgingForm />
      break
    case "JA_MED_MANUELL_GODKJENNING_PGA_UNDER_18":
      return <Under18Advarsel />
    case "JA_MED_MANUELL_GODKJENNING_PGA_IKKE_BOSATT":
    case "JA_MED_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS_GBR":
      return <KreverManuellGodkjenningAvVeileder />
      break
    case "ALLEREDE_UNDER_OPPFOLGING":
      return <AlleredeUnderOppfolging />
      break
    case "IKKE_LOVLIG_OPPHOLD":
    case "DOD":
    case "UKJENT_STATUS_FOLKEREGISTERET":
    case "INGEN_STATUS_FOLKEREGISTERET":
      return <IkkeMuligÅStarteOppfolging />
      break
  }
}

const StartOppfolgingForm = () => {
  const startOppfolgingFetcher = useFetcher()

  return (
    <div className="flex flex-col gap-8 pb-40">
      <Heading size={"large"}>Be om arbeidsrettet oppfølging</Heading>
      <div className="flex flex-col gap-2">
        <BodyShort weight="semibold">Dette kan du har rett til:</BodyShort>
        <List as="ul">
          <List.Item>Samtaler med veileder</List.Item>
          <List.Item>Arbeidsmarkedstiltak som kurs etc</List.Item>
          <List.Item>Du trenger ikke levere meldekort</List.Item>
        </List>
      </div>
      <div>
        <startOppfolgingFetcher.Form method="post">
          <Button
            iconPosition={"right"}
            icon={<PaperplaneIcon />}
            loading={startOppfolgingFetcher.state !== "idle"}
            disabled={startOppfolgingFetcher.state !== "idle"}
          >
            Jeg ønsker arbeidsrettet oppfølging fra Nav
          </Button>
        </startOppfolgingFetcher.Form>
      </div>
    </div>
  )
}

const AlleredeUnderOppfolging = () => {
  return (
    <div className="gap-4 flex flex-col pb-40">
      <Heading size={"large"}>Du er allerede registrert for oppfølging</Heading>
      <InnholdForDegUnderOppfolging />
    </div>
  )
}

const KreverManuellGodkjenningAvVeileder = () => {
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

const IkkeMuligÅStarteOppfolging = () => {
  return (
    <div className="flex flex-col gap-8">
      <Heading size={"large"}>Feil i folkereigsterstatus</Heading>
      <BodyShort>
        Du kan ikke være registrert død og få arbeidsoppfølging
      </BodyShort>
    </div>
  )
}

const Under18Advarsel = () => {
  return (
    <div className="gap-8 flex flex-col">
      <Heading size={"large"}>Under 18 år</Heading>
      <InfoCard data-color="info">
        <InfoCard.Header>
          <InfoCard.Title>
            Du må registreres for oppfolging av en veileder
          </InfoCard.Title>
        </InfoCard.Header>
        <InfoCard.Content>
          <BodyShort>
            Du er under 18 år og trenger samtykke fra foresatte for å få kunne
            motta oppfølging fra Nav
          </BodyShort>
          <br />
          <BodyShort>
            En veileder vil kontakte deg snart. Veilederen vil hjelpe deg videre
            med samtykke og registrering
          </BodyShort>
        </InfoCard.Content>
      </InfoCard>
    </div>
  )
}
