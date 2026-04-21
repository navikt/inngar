import { BodyShort, Button, Heading, List, LocalAlert } from "@navikt/ds-react"
import { useFetcher } from "react-router"
import type { KanStarteOppfolgingEkstern } from "~/api/veilarboppfolging"
import SkjemaIkon from "./skjema-ikon.svg?react"
import { PaperplaneIcon } from "@navikt/aksel-icons"
import { IkkeMuligÅStarteOppfolging } from "~/startOppfolging/tilfeller/IkkeMuligÅStarteOppfolging"
import { AlleredeUnderOppfolging } from "~/startOppfolging/tilfeller/AlleredeUnderOppfolging"
import { Under18Advarsel } from "~/startOppfolging/tilfeller/Under18Advarsel"
import { KreverManuellGodkjenningAvVeileder } from "~/startOppfolging/tilfeller/KreverManuellGodkjenningAvVeileder"
import { loggKnappKlikket } from "common"

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
        <BodyShort weight="semibold">Dette kan du få:</BodyShort>
        <List as="ul">
          <List.Item>Samtaler med veileder</List.Item>
          <List.Item>Arbeidsrettede tiltak eller kurs</List.Item>
          <List.Item>Veiledning og hjelp tilpasset din situasjon</List.Item>
        </List>
      </div>
      <div>
        <startOppfolgingFetcher.Form method="post">
          <Button
            iconPosition={"right"}
            icon={<PaperplaneIcon />}
            loading={startOppfolgingFetcher.state !== "idle"}
            disabled={startOppfolgingFetcher.state !== "idle"}
            onClick={() =>
              loggKnappKlikket("Jeg ønsker arbeidsrettet oppfølging fra Nav")
            }
          >
            Jeg ønsker arbeidsrettet oppfølging fra Nav
          </Button>
        </startOppfolgingFetcher.Form>
      </div>
    </div>
  )
}
