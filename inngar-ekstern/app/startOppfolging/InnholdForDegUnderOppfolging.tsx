import { Heading, LinkCard } from "@navikt/ds-react"
import { Env, getEnv } from "~/util/getEnv"

const env = getEnv()

const urls = {
  aktivitetsplan: {
    [Env.dev]: "https://aktivitetsplan.ekstern.dev.nav.no/",
    [Env.prod]: "https://aktivitetsplan.nav.no",
    [Env.local]: "/",
  },
  minside: {
    [Env.dev]: "https://ansatt.dev.nav.no/minside",
    [Env.prod]: "https://nav.no/minside",
    [Env.local]: "/",
  },
  dialog: {
    [Env.dev]: "https://pto.ekstern.dev.nav.no/arbeid/dialog/",
    [Env.prod]: "https://nav.no/arbeid/dialog",
    [Env.local]: "/",
  },
}

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
            Planlegg aktiviteter alene eller sammen med veileder
          </LinkCard.Description>
        </LinkCard>
        <LinkCard>
          <LinkCard.Title>
            <LinkCard.Anchor href={urls.minside[env]}>
              Aktivitetsplan
            </LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>
            Oversikt over tjenester og pengestøtte du får fra Nav
          </LinkCard.Description>
        </LinkCard>
        <LinkCard>
          <LinkCard.Title>
            <LinkCard.Anchor href={urls.dialog[env]}>Dialogen</LinkCard.Anchor>
          </LinkCard.Title>
          <LinkCard.Description>Snakk med veilederen din</LinkCard.Description>
        </LinkCard>
      </div>
    </>
  )
}
