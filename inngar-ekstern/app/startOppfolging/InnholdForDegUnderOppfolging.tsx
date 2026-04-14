import { Heading, LinkCard } from "@navikt/ds-react"

export const InnholdForDegUnderOppfolging = () => {
  return (
    <>
      <Heading size={"small"}>Innhold for deg som er under oppfølging</Heading>
      <div className="gap-2 mt-4 flex flex-col">
        <LinkCard>
          <LinkCard.Title>Aktivitetsplan</LinkCard.Title>
          <LinkCard.Description>
            Planlegg aktiviteter alene eller sammen med veileder
          </LinkCard.Description>
        </LinkCard>
        <LinkCard>
          <LinkCard.Title>Min side</LinkCard.Title>
          <LinkCard.Description>
            Oversikt over tjenester og pengestøtte du får fra Nav
          </LinkCard.Description>
        </LinkCard>
        <LinkCard>
          <LinkCard.Title>Dialogen</LinkCard.Title>
          <LinkCard.Description>Snakk med veilederen din</LinkCard.Description>
        </LinkCard>
      </div>
    </>
  )
}
