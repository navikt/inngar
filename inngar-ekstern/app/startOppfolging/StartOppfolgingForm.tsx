import { BodyShort, Button, Heading, InlineMessage } from "@navikt/ds-react"
import { useFetcher } from "react-router"
import type { Route } from "../routes/+types/home"
import { startOppfolging } from "../api/veilarboppfolging"
import { apps, getOboToken } from "common"

export function StartOppfolgingForm() {
    const startOppfolgingFetcher = useFetcher()

  return (
    <main className="flex items-center justify-center pt-4 md:pt-12 pb-4 p-4">
      <div className="max-w-[500px] flex-1 flex flex-col gap-8 min-h-96 min-h-0">
        <Heading size={"large"} >
            Hjelp til å komme i eller tilbake til jobb
        </Heading>
          <div className="flex flex-col gap-4">
          <BodyShort>Dette kan vi tilby:</BodyShort>
              <InlineMessage status="info">
              Samtaler med veileder
          </InlineMessage>
          <InlineMessage status="info">
              Arbeidsmarkedstiltak som kurs etc
          </InlineMessage>
          <InlineMessage status="info">
              Du trenger ikke levere meldekort
          </InlineMessage>
          </div>
          <div>
          <startOppfolgingFetcher.Form method="post">
              <Button>
                  Registrer meg
              </Button>
          </startOppfolgingFetcher.Form>
          </div>
      </div>
    </main>
  );
}

export const action = async (args: Route.ActionArgs) => {
    const formdata = await args.request.formData()
    const tokenOrResponse = await getOboToken(
        args.request,
        apps.veilarboppfolging,
    )
    return startOppfolging(args.request)
}