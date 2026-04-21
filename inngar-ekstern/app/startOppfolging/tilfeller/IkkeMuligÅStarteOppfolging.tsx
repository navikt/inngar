import { BodyShort, Heading } from "@navikt/ds-react"

export const IkkeMuligÅStarteOppfolging = () => {
  return (
    <div className="flex flex-col gap-8">
      <Heading size={"large"}>Feil i folkeregisterstatus</Heading>
      <BodyShort>
        Du kan ikke være registrert død og få arbeidsoppfølging
      </BodyShort>
    </div>
  )
}
