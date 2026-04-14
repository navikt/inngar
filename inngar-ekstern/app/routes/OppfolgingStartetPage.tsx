import { BodyLong, BodyShort, Heading } from "@navikt/ds-react"
import { InnholdForDegUnderOppfolging } from "~/startOppfolging/InnholdForDegUnderOppfolging"

const OppfolgingStartetPage = () => {
  return (
    <main className="flex items-center justify-center pt-4 md:pt-12 pb-4 p-4 pb-20">
      <div className="max-w-[600px] flex-1 flex flex-col gap-4 min-h-96 min-h-0">
        <Heading size={"large"}>Du er innskrevet for oppfølging</Heading>
        <BodyShort>Du vil snart bli kontaktet av en veileder</BodyShort>
        <BodyLong>
          Nav vil vurdere du har gitt oss mot opplysningene vi har om andre i
          omtrent samme situasjon. Basert på dette vil veileder fatte et
          oppfølgingsvedtak som sendes til deg. Vedtaked forteller hvordan Nav
          vurderer din situasjon i arbeidsmarkedet og hvilken hjelp du får av
          Nav.
        </BodyLong>
        <div className="mt-4">
          <InnholdForDegUnderOppfolging />
        </div>
      </div>
    </main>
  )
}

export default OppfolgingStartetPage
