import { Heading } from "@navikt/ds-react"
import { InnholdForDegUnderOppfolging } from "~/startOppfolging/InnholdForDegUnderOppfolging"

export const AlleredeUnderOppfolging = () => {
  return (
    <div className="gap-4 flex flex-col pb-40">
      <Heading size={"large"}>
        Du mottar allerede arbeidsrettet oppfølging
      </Heading>
      <InnholdForDegUnderOppfolging />
    </div>
  )
}
