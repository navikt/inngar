import { BodyLong, BodyShort, Heading } from "@navikt/ds-react"
import { InnholdForDegUnderOppfolging } from "~/startOppfolging/InnholdForDegUnderOppfolging"
import KvitteringIkon from "../startOppfolging/kvittering-ikon.svg?react"

const OppfolgingStartetPage = () => {
  return (
    <main className="flex gap-8 justify-center pt-4 md:pt-12 pb-4 p-4 pb-20">
      <KvitteringIkon />
      <div className="max-w-paragraph-width flex-1 flex flex-col gap-4 min-h-96 min-h-0">
        <Heading size={"large"}>
          Du har bedt om arbeidsrettet oppfølging
        </Heading>
        <BodyShort>Du vil etterhvert bli kontaktet av en veileder</BodyShort>
        <BodyLong>
          Sammen går dere gjennom situasjonen din og lager en plan for veien
          videre. Nav fatter et oppfølgingsvedtak som sendes til deg. Vedtaket
          beskriver hvordan Nav vurderer situasjonen din i arbeidsmarkedet, og
          hvilken hjelp du kan få.
        </BodyLong>
        <div className="mt-4">
          <InnholdForDegUnderOppfolging />
        </div>
      </div>
    </main>
  )
}

export default OppfolgingStartetPage
