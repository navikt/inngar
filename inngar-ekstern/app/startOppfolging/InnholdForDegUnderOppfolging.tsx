import { Heading, LinkCard } from "@navikt/ds-react"
import { env, urls } from "./urls"

export const InnholdForDegUnderOppfolging = () => {
  return (
    <>
      <Heading size={"small"}>Innhold for deg som er under oppfølging</Heading>
      <div className="gap-2 mt-4 flex flex-col">
        <LinkCard>
          <LinkCard.Title>
            <LinkCard.Anchor href={urls.aktivitetsplan[env]}>
              Aktivitetsplan
            </LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>
            Oversikt over aktivitetene dine, møter og referater
          </LinkCard.Description>
        </LinkCard>
        <LinkCard>
          <LinkCard.Title>
            <LinkCard.Anchor href={urls.minside[env]}>Min side</LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>
            Oversikt over tjenester og pengestøtte du får fra Nav
          </LinkCard.Description>
        </LinkCard>
        <LinkCard>
          <LinkCard.Title>
            <LinkCard.Anchor href={urls.dialog[env]}>Dialogen</LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>
            Still spørsmål, for eksempel om avtalte møter eller tiltak
          </LinkCard.Description>
        </LinkCard>
      </div>
    </>
  )
}
