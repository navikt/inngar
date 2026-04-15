import { BodyShort, Button, Heading, InlineMessage, LocalAlert } from "@navikt/ds-react"
import { useFetcher } from "react-router"
import type { KanStarteOppfolgingEkstern } from "~/api/veilarboppfolging"
import { InnholdForDegUnderOppfolging } from "~/startOppfolging/InnholdForDegUnderOppfolging"

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
      <main className="flex items-center justify-center pt-4 md:pt-12 pb-4 p-4">
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
    case "JA_MED_MANUELL_GODKJENNING_PGA_IKKE_BOSATT":
    case "JA_MED_MANUELL_GODKJENNING_PGA_DNUMMER_IKKE_EOS_GBR":
    case "IKKE_LOVLIG_OPPHOLD":
      return <KreverManuellGodkjenningAvVeileder />
      break
    case "ALLEREDE_UNDER_OPPFOLGING":
      return <AlleredeUnderOppfolging />
      break
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
    <div className="space-y-4 pb-40">
      <Heading size={"large"}>
        Hjelp til å komme i eller tilbake til jobb
      </Heading>
      <div className="flex flex-col gap-4">
        <BodyShort>Dette kan vi tilby:</BodyShort>
        <InlineMessage status="info">Samtaler med veileder</InlineMessage>
        <InlineMessage status="info">
          Arbeidsmarkedstiltak som kurs etc
        </InlineMessage>
        <InlineMessage status="info">
          Du trenger ikke levere meldekort
        </InlineMessage>
      </div>
      <div>
        <startOppfolgingFetcher.Form method="post">
          <Button>Registrer meg</Button>
        </startOppfolgingFetcher.Form>
      </div>
    </div>
  )
}

const AlleredeUnderOppfolging = () => {
  return (
    <div className="gap-4 flex flex-col pb-40">
      <Heading size={"large"}>Du er registrert for oppfølging</Heading>
      <BodyShort>Du vil etterhvert bli kontakt av en veileder</BodyShort>
      <BodyShort>
        Du vil etterhvert bli kontakt av en veileder Du vil etterhvert bli
        kontakt av en veilederDu vil etterhvert bli kontakt av en veilederDu vil
        etterhvert bli kontakt av en veilederDu vil etterhvert bli kontakt av en
        veilederDu vil etterhvert bli kontakt av en veileder
      </BodyShort>
      <InnholdForDegUnderOppfolging />
    </div>
  )
}

const KreverManuellGodkjenningAvVeileder = () => {
  return (
    <div>
      <Heading size={"large"}>Uavklart folkereigsterstatus</Heading>
      <BodyShort>Ikke riktig status</BodyShort>
    </div>
  )
}

const IkkeMuligÅStarteOppfolging = () => {
  return (
    <div>
      <Heading size={"large"}>Uavklart folkereigsterstatus</Heading>
      <BodyShort>Ikke mulig å starte oppfølging</BodyShort>
    </div>
  )
}
